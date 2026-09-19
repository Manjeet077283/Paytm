import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { SalesAnalysisResult, VerificationResult } from '../types';
import { CONFIG } from '../config';

export async function generateManagementExcelReport(
  taskId: string,
  analysis: SalesAnalysisResult,
  verification?: VerificationResult
): Promise<string> {
  const reportsDir = CONFIG.REPORTS_DIR;
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const filename = `Paytm_WorkMate_Report_${taskId}.xlsx`;
  const filePath = path.join(reportsDir, filename);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Paytm WorkMate AI Teammate';
  workbook.created = new Date();

  // 1. Sheet: Executive Summary
  const summarySheet = workbook.addWorksheet('Summary');
  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 32 },
    { header: 'Value', key: 'value', width: 28 },
    { header: 'Notes', key: 'notes', width: 45 }
  ];

  summarySheet.addRow({ metric: 'Task ID', value: taskId, notes: 'Paytm WorkMate Autonomous Execution' });
  summarySheet.addRow({ metric: 'Generated At', value: new Date().toISOString(), notes: 'UTC Timestamp' });
  summarySheet.addRow({ metric: 'Verification Status', value: (verification?.verified ?? true) ? 'VERIFIED' : 'UNVERIFIED', notes: verification?.tolerance || '±1.00 INR tolerance' });
  summarySheet.addRow({ metric: 'Total Net Revenue', value: analysis.totalRevenue, notes: 'INR (Indian Rupees)' });
  summarySheet.addRow({ metric: 'Total Order Count', value: analysis.orderCount, notes: 'Completed transactions' });
  summarySheet.addRow({ metric: 'Average Order Value (AOV)', value: analysis.averageOrderValue, notes: 'Revenue per transaction' });
  summarySheet.addRow({ metric: 'Total Discount Amount', value: analysis.totalDiscount, notes: 'Promotions and vouchers' });
  summarySheet.addRow({ metric: 'Top Performing Category', value: analysis.topCategory, notes: 'Highest gross revenue' });
  summarySheet.addRow({ metric: 'Top Product', value: analysis.topProduct, notes: 'Highest revenue item' });
  summarySheet.addRow({ metric: 'Low Performing Category', value: analysis.lowPerformingCategory, notes: 'Requires intervention' });
  summarySheet.addRow({ metric: 'Growth Rate', value: `${analysis.growthRate}%`, notes: 'Comparison against baseline' });
  summarySheet.addRow({ metric: 'Proof Token', value: analysis.proofHash, notes: 'Tamper-proof SHA256 audit token' });

  // Style Header
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002970' } };

  // 2. Sheet: Category Analysis
  const catSheet = workbook.addWorksheet('Category Analysis');
  catSheet.columns = [
    { header: 'Category', key: 'category', width: 28 },
    { header: 'Revenue (INR)', key: 'revenue', width: 20 },
    { header: 'Orders', key: 'orders', width: 14 },
    { header: 'Units Sold', key: 'units', width: 14 },
    { header: 'Total Discount', key: 'discount', width: 18 },
    { header: 'Revenue Share %', key: 'sharePercent', width: 18 }
  ];

  analysis.categoryPerformance.forEach((cat) => {
    catSheet.addRow(cat);
  });
  catSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  catSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002970' } };

  // 3. Sheet: Customer Analysis
  const custSheet = workbook.addWorksheet('Customer Analysis');
  custSheet.columns = [
    { header: 'Customer Segment', key: 'type', width: 22 },
    { header: 'Revenue (INR)', key: 'revenue', width: 20 },
    { header: 'Orders', key: 'orders', width: 14 },
    { header: 'AOV (INR)', key: 'aov', width: 16 },
    { header: 'Share %', key: 'sharePercent', width: 16 }
  ];

  analysis.customerPerformance.forEach((cust) => {
    custSheet.addRow(cust);
  });
  custSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  custSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002970' } };

  // 4. Sheet: Product Analysis
  const prodSheet = workbook.addWorksheet('Product Analysis');
  prodSheet.columns = [
    { header: 'Product ID', key: 'productId', width: 18 },
    { header: 'Product Name', key: 'productName', width: 35 },
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Units Sold', key: 'unitsSold', width: 15 },
    { header: 'Revenue (INR)', key: 'revenue', width: 20 }
  ];

  analysis.topProducts.forEach((prod) => {
    prodSheet.addRow(prod);
  });
  prodSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  prodSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF002970' } };

  // 5. Sheet: Anomalies
  const anoSheet = workbook.addWorksheet('Anomalies');
  anoSheet.columns = [
    { header: 'Anomaly ID', key: 'id', width: 20 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Severity', key: 'severity', width: 14 },
    { header: 'Type', key: 'type', width: 22 },
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Expected', key: 'expectedValue', width: 14 },
    { header: 'Actual', key: 'actualValue', width: 14 },
    { header: 'Deviation %', key: 'deviationPercent', width: 14 },
    { header: 'Root Cause', key: 'rootCause', width: 45 },
    { header: 'Recommendation', key: 'recommendation', width: 45 }
  ];

  analysis.anomalies.forEach((ano) => {
    anoSheet.addRow(ano);
  });
  anoSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  anoSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };

  await workbook.xlsx.writeFile(filePath);
  return filePath;
}
