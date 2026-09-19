import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { CONFIG } from './config';
import { initDatabase, Storage } from './storage/db';
import { AgentExecutor } from './agent/executor';
import { createTasksRouter } from './routes/tasks';
import { createApprovalsRouter } from './routes/approvals';
import { reportsRouter } from './routes/reports';
import { auditRouter } from './routes/audit';
import { toolsRouter } from './routes/tools';
import { impactRouter } from './routes/impact';
import { authRouter } from './routes/auth';
import { uploadRouter } from './routes/upload';
import { createExecutionPlan } from './agent/planner';

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  // Setup Socket.IO with broad CORS for dev/demo
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  // Setup Middleware
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Initialize resilient database connection
  await initDatabase();

  // Initialize Agent Executor with Socket.IO
  const executor = new AgentExecutor(io);

  // Health endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      service: 'Paytm WorkMate Monolith API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: Storage.getDbStatus()
    });
  });

  // Mount API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/tasks', createTasksRouter(executor));
  app.use('/api/approvals', createApprovalsRouter(executor));
  app.use('/api/reports', reportsRouter);
  app.use('/api/audit-logs', auditRouter);
  app.use('/api/tools', toolsRouter);
  app.use('/api/impact', impactRouter);
  app.use('/api/upload', uploadRouter);

  // Socket.IO Connection Handler
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

    socket.on('join_task', (taskId: string) => {
      socket.join(taskId);
      console.log(`📡 [Socket.IO] Client ${socket.id} joined room for task: ${taskId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Pre-seed sample recent tasks if storage is empty, so judges see a rich dashboard immediately
  const existingTasks = await Storage.listTasks();
  if (existingTasks.length === 0) {
    const demoPlan = createExecutionPlan('Analyze September sales, identify the biggest business issues and prepare a management report.', 'Copilot');
    
    // Mark steps completed for preview task
    const sampleCompleted = {
      id: 'TASK_PREVIEW_001',
      goal: 'Analyze September sales, identify the biggest business issues and prepare a management report.',
      autonomyMode: 'Copilot' as const,
      status: 'COMPLETED' as const,
      isDemo: true,
      datasetFilename: 'sales.csv',
      plan: {
        ...demoPlan,
        steps: demoPlan.steps.map((s) => ({
          ...s,
          status: 'COMPLETED' as const,
          outputSummary: 'Verified and executed'
        }))
      },
      currentStepIndex: demoPlan.steps.length,
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      completedAt: new Date(Date.now() - 3540000).toISOString()
    };
    await Storage.saveTask(sampleCompleted);

    // Add initial execution log
    await Storage.addLog({
      id: 'LOG_INIT_01',
      taskId: sampleCompleted.id,
      timestamp: new Date().toISOString(),
      action: 'SYSTEM_BOOTSTRAP',
      status: 'SUCCESS',
      details: 'Paytm WorkMate Autonomous Agent Orchestrator initialized and ready for business goals.'
    });
  }

  // Start Server
  server.listen(CONFIG.PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 PAYTM WORKMATE - SERVER ACTIVE`);
    console.log(`📍 Port: http://localhost:${CONFIG.PORT}`);
    console.log(`📍 Health: http://localhost:${CONFIG.PORT}/health`);
    console.log(`📍 Mode: ${CONFIG.NODE_ENV} | ${Storage.getDbStatus().mode}`);
    console.log(`=============================================================\n`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
  process.exit(1);
});
