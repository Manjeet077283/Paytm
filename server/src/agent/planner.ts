import { AutonomyMode, ExecutionPlan, TaskStep } from '../types';
import { GeminiService } from './geminiService';

export async function generatePlanWithAI(goal: string, autonomyMode: AutonomyMode = 'Copilot'): Promise<ExecutionPlan> {
  if (GeminiService.isConfigured()) {
    const geminiPlan = await GeminiService.generateExecutionPlan(goal, autonomyMode);
    if (geminiPlan) return geminiPlan;
  }
  return createExecutionPlan(goal, autonomyMode);
}

export function createExecutionPlan(goal: string, autonomyMode: AutonomyMode = 'Copilot'): ExecutionPlan {
  const normalizedGoal = goal.toLowerCase();

  // Dynamically tailor steps based on goal context while maintaining a consistent enterprise workflow
  const isAnomalyFocused = normalizedGoal.includes('anomaly') || normalizedGoal.includes('leakage') || normalizedGoal.includes('failure');
  const isCustomerFocused = normalizedGoal.includes('customer') || normalizedGoal.includes('retention') || normalizedGoal.includes('segment');

  const steps: TaskStep[] = [
    {
      id: 'step_1',
      order: 1,
      title: 'Understand Business Objective',
      description: `Interpret scope, target period, and KPIs for goal: "${goal}"`,
      tool: 'understand_objective',
      status: 'PENDING'
    },
    {
      id: 'step_2',
      order: 2,
      title: 'Load Sales Dataset',
      description: 'Stream transaction dataset and establish authenticated connection to synthetic data store.',
      tool: 'read_sales_data',
      status: 'PENDING'
    },
    {
      id: 'step_3',
      order: 3,
      title: 'Validate Dataset Integrity',
      description: 'Check column schemas, data types, null counts, and detect malformed entries.',
      tool: 'validate_dataset',
      status: 'PENDING'
    },
    {
      id: 'step_4',
      order: 4,
      title: isCustomerFocused ? 'Analyze Customer Segments' : 'Analyze Sales & Financial Metrics',
      description: 'Calculate total GMV, orders, AOV, category distributions, and daily revenue patterns.',
      tool: 'analyze_sales',
      status: 'PENDING'
    },
    {
      id: 'step_5',
      order: 5,
      title: 'Detect Business Anomalies',
      description: 'Apply statistical Z-scores and business heuristics to detect revenue drops and discount leaks.',
      tool: 'detect_anomalies',
      status: 'PENDING'
    },
    {
      id: 'step_6',
      order: 6,
      title: 'Generate Business Insights',
      description: 'Synthesize raw analytical findings into executive-level strategic summaries.',
      tool: 'generate_insights',
      status: 'PENDING'
    },
    {
      id: 'step_7',
      order: 7,
      title: 'Formulate Recommendations',
      description: 'Formulate high-impact corrective measures with measurable expected ROI.',
      tool: 'generate_recommendations',
      status: 'PENDING'
    },
    {
      id: 'step_8',
      order: 8,
      title: 'Independently Verify Results',
      description: 'Recalculate key mathematical metrics against raw ground-truth stream to verify zero hallucination.',
      tool: 'verify_results',
      status: 'PENDING'
    }
  ];

  // In Copilot mode, insert an approval step before finalizing consequential changes
  if (autonomyMode === 'Copilot') {
    steps.push({
      id: 'step_9',
      order: 9,
      title: 'Governance & Action Approval',
      description: 'Pause for human authorization on proposed promotional capping and routing changes.',
      tool: 'request_approval',
      status: 'PENDING'
    });
  }

  steps.push({
    id: `step_${steps.length + 1}`,
    order: steps.length + 1,
    title: 'Generate Management Report & Artifacts',
    description: 'Compile executive report and generate production PDF and multi-sheet Excel workbooks.',
    tool: 'generate_report',
    status: 'PENDING'
  });

  return {
    goal,
    summary: `Structured execution plan formulated with ${steps.length} sequential, verified steps under ${autonomyMode} autonomy mode.`,
    autonomyMode,
    steps
  };
}
