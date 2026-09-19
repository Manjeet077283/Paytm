import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Storage } from '../storage/db';
import { generatePlanWithAI } from '../agent/planner';
import { AgentExecutor } from '../agent/executor';
import { TaskRecord, AutonomyMode } from '../types';

export function createTasksRouter(executor: AgentExecutor): Router {
  const router = Router();

  const CreateTaskBodySchema = z.object({
    goal: z.string().min(5, 'Goal must be at least 5 characters'),
    autonomyMode: z.enum(['Assist', 'Copilot', 'Autonomous']).default('Copilot'),
    isDemo: z.boolean().default(false),
    datasetFilename: z.string().optional()
  });

  // POST /api/tasks - Create a new task & generate structured plan
  router.post('/', async (req: Request, res: Response) => {
    try {
      const parsed = CreateTaskBodySchema.parse(req.body);
      const taskId = `TASK_${Date.now()}`;

      const plan = await generatePlanWithAI(parsed.goal, parsed.autonomyMode as AutonomyMode);

      const task: TaskRecord = {
        id: taskId,
        goal: parsed.goal,
        autonomyMode: parsed.autonomyMode as AutonomyMode,
        status: 'PLANNING',
        isDemo: parsed.isDemo,
        datasetFilename: parsed.datasetFilename || 'sales.csv',
        plan,
        currentStepIndex: 0,
        startedAt: new Date().toISOString()
      };

      await Storage.saveTask(task);
      return res.status(201).json({ success: true, task });
    } catch (err: any) {
      return res.status(400).json({ success: false, error: err.message || 'Failed to create task' });
    }
  });

  // GET /api/tasks - List all tasks
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const tasks = await Storage.listTasks();
      return res.json({ success: true, tasks });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/tasks/:id - Get task detail
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const task = await Storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      return res.json({ success: true, task });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/tasks/:id/run - Execute task asynchronously and stream live updates
  router.post('/:id/run', async (req: Request, res: Response) => {
    try {
      const task = await Storage.getTask(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      // Launch execution in background; client watches live Socket.IO events
      executor.runTask(task.id).catch((err) => {
        console.error(`Task ${task.id} execution error:`, err);
      });

      return res.json({ success: true, message: 'Execution initiated', taskId: task.id });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/tasks/:id/cancel - Abort running task
  router.post('/:id/cancel', async (req: Request, res: Response) => {
    try {
      const task = await Storage.getTask(req.params.id);
      if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

      task.status = 'FAILED';
      task.error = 'Task cancelled by operator.';
      await Storage.saveTask(task);
      return res.json({ success: true, task });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
