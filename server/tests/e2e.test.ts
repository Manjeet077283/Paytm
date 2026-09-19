import assert from 'assert';
import { createExecutionPlan } from '../src/agent/planner';
import { defaultToolRouter } from '../src/agent/toolRouter';
import { AgentExecutor, registerCoreTools } from '../src/agent/executor';
import { executeSalesAnalysis } from '../src/analytics/salesEngine';
import { verifyCalculations } from '../src/analytics/verificationEngine';
import { generateManagementPdfReport } from '../src/reports/pdfGenerator';
import { generateManagementExcelReport } from '../src/reports/excelGenerator';
import { Storage } from '../src/storage/db';
import { TaskRecord, Permission } from '../src/types';
import fs from 'fs';

async function runE2EIntegrationTest() {
  console.log('🧪 ========================================================');
  console.log('🧪 PAYTM WORKMATE - END-TO-END INTEGRATION TEST SUITE');
  console.log('🧪 ========================================================\n');

  // Test 1: Goal Parser & Planner
  console.log('▶ TEST 1: Goal Parser & Structured Planner...');
  const goal = 'Analyze September sales, identify the biggest business issues and prepare a management report.';
  const plan = createExecutionPlan(goal, 'Autonomous');
  assert.strictEqual(plan.steps.length > 5, true, 'Planner should produce sequential steps');
  assert.strictEqual(plan.autonomyMode, 'Autonomous');
  console.log(`  ✓ Planner created ${plan.steps.length} structured steps with tool bindings.\n`);

  // Test 2: Tool Registry & Router Permissions
  console.log('▶ TEST 2: Tool Registry & Permission Guardrails...');
  registerCoreTools();
  const tools = defaultToolRouter.listTools();
  assert.strictEqual(tools.length >= 10, true, 'All 10 core tools must be registered');

  // Verify unauthorized execution is blocked
  const blockedResult = await defaultToolRouter.executeTool(
    'analyze_sales',
    {},
    {
      taskId: 'TEST_UNAUTH',
      callerPermissions: [Permission.READ_SALES_DATA], // missing ANALYZE_DATA
      state: {}
    }
  );
  assert.strictEqual(blockedResult.success, false, 'Should block execution if permission missing');
  console.log('  ✓ Unauthorized execution correctly blocked by Tool Router.');
  console.log(`  ✓ Verified ${tools.length} enterprise tools in registry.\n`);

  // Test 3: Deterministic Sales Engine & Anomaly Detection
  console.log('▶ TEST 3: Deterministic Financial Analytics & Anomaly Detection...');
  const analysis = await executeSalesAnalysis();
  assert.strictEqual(typeof analysis.totalRevenue, 'number');
  assert.strictEqual(analysis.orderCount > 0, true);
  assert.strictEqual(analysis.anomalies.length > 0, true, 'Should detect built-in anomalies');
  console.log(`  ✓ Calculated GMV: ₹${analysis.totalRevenue.toLocaleString('en-IN')}`);
  console.log(`  ✓ Orders: ${analysis.orderCount} | AOV: ₹${analysis.averageOrderValue}`);
  console.log(`  ✓ Detected Anomalies: ${analysis.anomalies.length} (Revenue drops, discount erosion)\n`);

  // Test 4: Independent Mathematical Verification
  console.log('▶ TEST 4: Independent Mathematical Ground-Truth Verification...');
  const verification = await verifyCalculations(analysis.datasetPath, {
    totalRevenue: analysis.totalRevenue,
    orderCount: analysis.orderCount,
    averageOrderValue: analysis.averageOrderValue,
    topCategory: analysis.topCategory
  });
  assert.strictEqual(verification.verified, true, 'Verification must pass on exact ground truth');
  assert.strictEqual(verification.discrepancies.length, 0, 'Zero discrepancies expected');
  console.log(`  ✓ Mathematical Verification: PASSED (Proof Hash: ${verification.proofToken.substring(0, 16)}...)\n`);

  // Test 5: Report Generators (PDF & Excel)
  console.log('▶ TEST 5: Artifact Export (PDF & Multi-sheet Excel)...');
  const pdfPath = await generateManagementPdfReport('E2E_TEST', analysis, verification);
  const excelPath = await generateManagementExcelReport('E2E_TEST', analysis, verification);
  assert.strictEqual(fs.existsSync(pdfPath), true, 'PDF report file must exist');
  assert.strictEqual(fs.existsSync(excelPath), true, 'Excel report file must exist');
  console.log(`  ✓ PDF Export: ${pdfPath} (${fs.statSync(pdfPath).size} bytes)`);
  console.log(`  ✓ Excel Export: ${excelPath} (${fs.statSync(excelPath).size} bytes)\n`);

  // Test 6: Full Autonomous Execution Workflow
  console.log('▶ TEST 6: Complete End-to-End Task Lifecycle...');
  const executor = new AgentExecutor();
  const testTaskId = `TASK_E2E_${Date.now()}`;
  const fullTask: TaskRecord = {
    id: testTaskId,
    goal,
    autonomyMode: 'Autonomous',
    status: 'PLANNING',
    isDemo: true,
    datasetFilename: 'sales.csv',
    plan,
    currentStepIndex: 0,
    startedAt: new Date().toISOString()
  };
  await Storage.saveTask(fullTask);

  const completedTask = await executor.runTask(testTaskId);
  assert.strictEqual(completedTask.status, 'COMPLETED', 'Task status must transition to COMPLETED');
  assert.strictEqual(completedTask.analysisResult !== undefined, true, 'Analysis must be attached');
  assert.strictEqual(completedTask.reportMetadata !== undefined, true, 'Report metadata must be generated');

  const auditLogs = await Storage.getLogsByTask(testTaskId);
  assert.strictEqual(auditLogs.length > 5, true, 'Audit logs must capture chronological execution history');
  console.log(`  ✓ Task completed all ${completedTask.plan?.steps.length} steps autonomously.`);
  console.log(`  ✓ Recorded ${auditLogs.length} chronological audit entries.`);
  console.log('\n🎉 ========================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED WITH 100% ACCURACY!');
  console.log('🎉 ========================================================\n');
}

runE2EIntegrationTest().catch((err) => {
  console.error('❌ E2E Integration Test Failed:', err);
  process.exit(1);
});
