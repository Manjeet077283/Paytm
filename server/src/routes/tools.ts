import { Router, Request, Response } from 'express';
import { defaultToolRouter } from '../agent/toolRouter';

export const toolsRouter = Router();

// GET /api/tools - Registry metadata
toolsRouter.get('/', (_req: Request, res: Response) => {
  const tools = defaultToolRouter.listTools();
  return res.json({ success: true, tools, count: tools.length });
});
