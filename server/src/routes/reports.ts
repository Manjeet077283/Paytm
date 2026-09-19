import { Router, Request, Response } from 'express';
import fs from 'fs';
import { Storage } from '../storage/db';

export const reportsRouter = Router();

// GET /api/reports/:id - Get report metadata
reportsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const report = await Storage.getReport(req.params.id);
    if (!report) {
      // Also try fetching by taskId
      const byTask = await Storage.getReportByTask(req.params.id);
      if (byTask) return res.json({ success: true, report: byTask });
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    return res.json({ success: true, report });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/:id/pdf - Download PDF
reportsRouter.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    let report = await Storage.getReport(req.params.id);
    if (!report) {
      report = await Storage.getReportByTask(req.params.id);
    }
    if (!report || !report.pdfPath || !fs.existsSync(report.pdfPath)) {
      return res.status(404).json({ success: false, error: 'PDF report not found or not yet generated' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Paytm_WorkMate_Report_${report.taskId}.pdf"`);
    return fs.createReadStream(report.pdfPath).pipe(res);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/:id/excel - Download Excel
reportsRouter.get('/:id/excel', async (req: Request, res: Response) => {
  try {
    let report = await Storage.getReport(req.params.id);
    if (!report) {
      report = await Storage.getReportByTask(req.params.id);
    }
    if (!report || !report.excelPath || !fs.existsSync(report.excelPath)) {
      return res.status(404).json({ success: false, error: 'Excel report not found or not yet generated' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Paytm_WorkMate_Report_${report.taskId}.xlsx"`);
    return fs.createReadStream(report.excelPath).pipe(res);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
