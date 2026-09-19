import { Router, Request, Response } from 'express';
import { Storage } from '../storage/db';
import { AgentExecutor } from '../agent/executor';

export function createApprovalsRouter(executor: AgentExecutor): Router {
  const router = Router();

  // GET /api/approvals - List all approvals
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const approvals = await Storage.listApprovals();
      return res.json({ success: true, approvals });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/approvals/:id/approve - Approve and resume task execution
  router.post('/:id/approve', async (req: Request, res: Response) => {
    try {
      const approval = await Storage.getApproval(req.params.id);
      if (!approval) return res.status(404).json({ success: false, error: 'Approval request not found' });

      const comments = req.body.comments || 'Approved by operator';
      executor.resumeAfterApproval(approval.taskId, 'APPROVE', comments).catch((err) => {
        console.error('Error resuming task after approval:', err);
      });

      return res.json({ success: true, message: 'Approval granted. Task execution resuming.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/approvals/:id/reject - Reject action
  router.post('/:id/reject', async (req: Request, res: Response) => {
    try {
      const approval = await Storage.getApproval(req.params.id);
      if (!approval) return res.status(404).json({ success: false, error: 'Approval request not found' });

      const comments = req.body.comments || 'Rejected by operator';
      executor.resumeAfterApproval(approval.taskId, 'REJECT', comments).catch((err) => {
        console.error('Error rejecting task after approval:', err);
      });

      return res.json({ success: true, message: 'Action rejected by operator.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
