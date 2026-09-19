import { Router, Request, Response } from 'express';
import { Storage } from '../storage/db';

export const auditRouter = Router();

// GET /api/audit-logs - All system audit logs
auditRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const logs = await Storage.getAllLogs();
    return res.json({ success: true, logs, total: logs.length });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tasks/:id/logs - Task specific audit logs
auditRouter.get('/task/:id', async (req: Request, res: Response) => {
  try {
    const logs = await Storage.getLogsByTask(req.params.id);
    return res.json({ success: true, logs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
