import fs from 'fs';
import crypto from 'crypto';
import csv from 'csv-parser';
import { VerificationResult } from '../types';
import { resolveDatasetPath } from './salesEngine';

export async function verifyCalculations(
  datasetPath: string,
  claimedMetrics: {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    topCategory: string;
  }
): Promise<VerificationResult> {
  const filePath = resolveDatasetPath(datasetPath);

  // Independently recalculate directly from raw stream without relying on any cache
  return new Promise((resolve, reject) => {
    let actualRevenue = 0;
    let actualOrders = 0;
    const catRevenue = new Map<string, number>();

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: any) => {
        const rev = parseFloat(row.revenue || row.net_amount || '0');
        const cat = row.category || 'Uncategorized';
        actualRevenue += rev;
        actualOrders += 1;
        catRevenue.set(cat, (catRevenue.get(cat) || 0) + rev);
      })
      .on('end', () => {
        actualRevenue = Math.round(actualRevenue * 100) / 100;
        const actualAov = actualOrders > 0 ? Math.round((actualRevenue / actualOrders) * 100) / 100 : 0;

        let actualTopCat = '';
        let maxCatRev = -1;
        for (const [cat, rev] of catRevenue.entries()) {
          if (rev > maxCatRev) {
            maxCatRev = rev;
            actualTopCat = cat;
          }
        }

        const discrepancies: Array<{
          metric: string;
          claimed: any;
          actual: any;
          difference?: any;
        }> = [];

        // Check revenue (allow ±1.0 INR rounding tolerance)
        if (Math.abs(actualRevenue - claimedMetrics.totalRevenue) > 1.0) {
          discrepancies.push({
            metric: 'totalRevenue',
            claimed: claimedMetrics.totalRevenue,
            actual: actualRevenue,
            difference: Math.abs(actualRevenue - claimedMetrics.totalRevenue)
          });
        }

        // Check order count (exact match)
        if (actualOrders !== claimedMetrics.orderCount) {
          discrepancies.push({
            metric: 'orderCount',
            claimed: claimedMetrics.orderCount,
            actual: actualOrders,
            difference: Math.abs(actualOrders - claimedMetrics.orderCount)
          });
        }

        // Check AOV
        if (Math.abs(actualAov - claimedMetrics.averageOrderValue) > 0.1) {
          discrepancies.push({
            metric: 'averageOrderValue',
            claimed: claimedMetrics.averageOrderValue,
            actual: actualAov,
            difference: Math.abs(actualAov - claimedMetrics.averageOrderValue)
          });
        }

        // Check top category
        if (actualTopCat.toLowerCase() !== claimedMetrics.topCategory.toLowerCase()) {
          discrepancies.push({
            metric: 'topCategory',
            claimed: claimedMetrics.topCategory,
            actual: actualTopCat,
            difference: 'Category name mismatch'
          });
        }

        const verified = discrepancies.length === 0;
        const proofToken = crypto
          .createHash('sha256')
          .update(`${actualRevenue}:${actualOrders}:${verified}:${Date.now()}`)
          .digest('hex');

        resolve({
          verified,
          discrepancies,
          actualMetrics: {
            totalRevenue: actualRevenue,
            orderCount: actualOrders,
            averageOrderValue: actualAov,
            topCategory: actualTopCat
          },
          tolerance: '±1.00 INR absolute numerical tolerance',
          proofToken,
          verifiedAt: new Date().toISOString()
        });
      })
      .on('error', (err) => reject(err));
  });
}
