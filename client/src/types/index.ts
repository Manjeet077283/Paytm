export type AutonomyMode = 'Assist' | 'Copilot' | 'Autonomous';

export type TaskStatus =
  | 'PLANNING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'WAITING_FOR_APPROVAL'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING';

export type StepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';

export interface TaskStep {
  id: string;
  order: number;
  title: string;
  description: string;
  tool: string;
  status: StepStatus;
  startedAt?: string;
  completedAt?: string;
  outputSummary?: string;
  dataProof?: any;
  error?: string;
}

export interface ExecutionPlan {
  goal: string;
  summary: string;
  autonomyMode: AutonomyMode;
  steps: TaskStep[];
}

export interface AnomalyItem {
  id: string;
  date: string;
  type: 'REVENUE_DROP' | 'DISCOUNT_EROSION' | 'PAYMENT_FAILURE' | 'BULK_ANOMALY';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  metric: string;
  expectedValue: number;
  actualValue: number;
  deviationPercent: number;
  rootCause: string;
  recommendation: string;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  orders: number;
  units: number;
  discount: number;
  sharePercent: number;
}

export interface CustomerTypePerformance {
  type: 'RETURNING' | 'NEW';
  revenue: number;
  orders: number;
  aov: number;
  sharePercent: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export interface RecommendationItem {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  estimatedImpact: string;
}

export interface SalesAnalysisResult {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  totalDiscount: number;
  overallFailureRate: number;
  topCategory: string;
  topProduct: string;
  lowPerformingCategory: string;
  growthRate: number;
  dailyRevenueTrend: { date: string; revenue: number; orders: number; avg_discount: number }[];
  categoryPerformance: CategoryPerformance[];
  customerPerformance: CustomerTypePerformance[];
  topProducts: TopProduct[];
  anomalies: AnomalyItem[];
  insights: string[];
  recommendations: RecommendationItem[];
  verified: boolean;
  proofHash: string;
  datasetPath: string;
  analyzedAt: string;
}

export interface VerificationResult {
  verified: boolean;
  discrepancies: Array<{
    metric: string;
    claimed: any;
    actual: any;
    difference?: any;
  }>;
  actualMetrics: {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    topCategory: string;
  };
  tolerance: string;
  proofToken: string;
  verifiedAt: string;
}

export interface ExecutionLog {
  id: string;
  taskId: string;
  timestamp: string;
  action: string;
  tool?: string;
  status: 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR';
  details: string;
  durationMs?: number;
  proofData?: any;
}

export interface ApprovalRequest {
  id: string;
  taskId: string;
  title: string;
  reason: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  affectedEntity: string;
  expectedAction: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  decidedAt?: string;
  comments?: string;
}

export interface ReportMetadata {
  id: string;
  taskId: string;
  title: string;
  summary: string;
  generatedAt: string;
  pdfPath?: string;
  excelPath?: string;
  metrics: {
    totalRevenue: number;
    orderCount: number;
    averageOrderValue: number;
    topCategory: string;
    anomalyCount: number;
  };
  verified: boolean;
}

export interface TaskRecord {
  id: string;
  userId?: string;
  goal: string;
  autonomyMode: AutonomyMode;
  status: TaskStatus;
  isDemo: boolean;
  datasetFilename: string;
  plan?: ExecutionPlan;
  currentStepIndex: number;
  analysisResult?: SalesAnalysisResult;
  verificationResult?: VerificationResult;
  reportMetadata?: ReportMetadata;
  pendingApprovalId?: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}
