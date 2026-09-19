import mongoose, { Schema } from 'mongoose';
import { CONFIG } from '../config';
import { TaskRecord, ExecutionLog, ApprovalRequest, ReportMetadata } from '../types';

let isMongoConnected = false;

// Resilient In-Memory Collections (active fallback whenever MongoDB is offline)
const inMemoryTasks = new Map<string, TaskRecord>();
const inMemoryLogs: ExecutionLog[] = [];
const inMemoryApprovals = new Map<string, ApprovalRequest>();
const inMemoryReports = new Map<string, ReportMetadata>();

// Mongoose Schemas for MongoDB Atlas
const TaskSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: String,
    goal: { type: String, required: true },
    autonomyMode: { type: String, default: 'Copilot' },
    status: { type: String, default: 'PLANNING' },
    isDemo: { type: Boolean, default: false },
    datasetFilename: { type: String, default: 'sales.csv' },
    plan: Schema.Types.Mixed,
    currentStepIndex: { type: Number, default: 0 },
    analysisResult: Schema.Types.Mixed,
    verificationResult: Schema.Types.Mixed,
    reportMetadata: Schema.Types.Mixed,
    pendingApprovalId: String,
    startedAt: { type: String, default: () => new Date().toISOString() },
    completedAt: String,
    error: String
  },
  { timestamps: true, strict: false }
);

const LogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    taskId: { type: String, required: true, index: true },
    timestamp: { type: String, required: true },
    action: { type: String, required: true },
    tool: String,
    status: { type: String, default: 'INFO' },
    details: { type: String, required: true },
    durationMs: Number,
    proofData: Schema.Types.Mixed
  },
  { timestamps: true, strict: false }
);

const ApprovalSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    taskId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    reason: String,
    riskLevel: { type: String, default: 'HIGH' },
    affectedEntity: String,
    expectedAction: String,
    status: { type: String, default: 'PENDING' },
    requestedAt: { type: String, default: () => new Date().toISOString() },
    decidedAt: String,
    comments: String
  },
  { timestamps: true, strict: false }
);

const ReportSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    taskId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    summary: String,
    generatedAt: { type: String, default: () => new Date().toISOString() },
    pdfPath: String,
    excelPath: String,
    metrics: Schema.Types.Mixed,
    verified: { type: Boolean, default: true }
  },
  { timestamps: true, strict: false }
);

let TaskModel: mongoose.Model<any>;
let LogModel: mongoose.Model<any>;
let ApprovalModel: mongoose.Model<any>;
let ReportModel: mongoose.Model<any>;

try {
  TaskModel = mongoose.model('Task', TaskSchema);
  LogModel = mongoose.model('ExecutionLog', LogSchema);
  ApprovalModel = mongoose.model('Approval', ApprovalSchema);
  ReportModel = mongoose.model('Report', ReportSchema);
} catch (e) {
  // Model already registered
  TaskModel = mongoose.models.Task;
  LogModel = mongoose.models.ExecutionLog;
  ApprovalModel = mongoose.models.Approval;
  ReportModel = mongoose.models.Report;
}

export async function initDatabase(): Promise<void> {
  const uri = CONFIG.MONGODB_URI;

  // Mask credentials for clean logging
  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');

  // Check if placeholder password is still in the URI
  if (uri.includes('<db_password>')) {
    isMongoConnected = false;
    console.warn(`\n⚠️ [Paytm WorkMate DB] MongoDB Atlas URI contains '<db_password>' placeholder.`);
    console.warn(`⚠️ Seamlessly operating in Resilient In-Memory Storage mode (Zero Demo Downtime).\n`);
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    const connectionPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000 // Fast failover if Atlas IP whitelist or network is blocked
    });

    await connectionPromise;
    isMongoConnected = true;
    console.log(`\n✅ [Paytm WorkMate DB] Connected to MongoDB Atlas at: ${maskedUri}\n`);

    // Sync in-memory items from Atlas on boot
    try {
      const existingTasks = await TaskModel.find({}).limit(50).lean();
      existingTasks.forEach((t: any) => inMemoryTasks.set(t.id, t));
      console.log(`📦 [Paytm WorkMate DB] Synced ${existingTasks.length} tasks from MongoDB Atlas.`);
    } catch (syncErr) {
      // Non-critical
    }
  } catch (err: any) {
    isMongoConnected = false;
    console.warn(`\n⚠️ [Paytm WorkMate DB] MongoDB Atlas connection failed (${err.message}).`);
    console.warn(`⚠️ Seamlessly operating in Resilient In-Memory Storage mode (Zero Demo Downtime).\n`);
  }
}

export const Storage = {
  // Tasks
  async saveTask(task: TaskRecord): Promise<TaskRecord> {
    inMemoryTasks.set(task.id, { ...task });
    if (isMongoConnected) {
      try {
        await TaskModel.findOneAndUpdate({ id: task.id }, task, { upsert: true, new: true });
      } catch (err) {
        console.warn('MongoDB Task save warning:', err);
      }
    }
    return task;
  },

  async getTask(id: string): Promise<TaskRecord | null> {
    const task = inMemoryTasks.get(id);
    if (task) return { ...task };

    if (isMongoConnected) {
      try {
        const doc: any = await TaskModel.findOne({ id }).lean();
        if (doc) {
          inMemoryTasks.set(doc.id, doc as any);
          return doc as any;
        }
      } catch (err) {
        // Fallback to in-memory
      }
    }
    return null;
  },

  async listTasks(): Promise<TaskRecord[]> {
    if (isMongoConnected) {
      try {
        const docs = await TaskModel.find({}).sort({ startedAt: -1 }).limit(100).lean();
        if (docs && docs.length > 0) {
          docs.forEach((d: any) => inMemoryTasks.set(d.id, d));
          return docs as any[];
        }
      } catch (err) {
        // Fallback to in-memory
      }
    }
    return Array.from(inMemoryTasks.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  },

  // Execution Logs
  async addLog(log: ExecutionLog): Promise<void> {
    inMemoryLogs.push({ ...log });
    if (isMongoConnected) {
      try {
        await LogModel.create(log);
      } catch (err) {
        // Fallback silently
      }
    }
  },

  async getLogsByTask(taskId: string): Promise<ExecutionLog[]> {
    if (isMongoConnected) {
      try {
        const docs = await LogModel.find({ taskId }).sort({ timestamp: 1 }).lean();
        if (docs && docs.length > 0) return docs as any[];
      } catch (err) {
        // Fallback
      }
    }
    return inMemoryLogs.filter((l) => l.taskId === taskId);
  },

  async getAllLogs(): Promise<ExecutionLog[]> {
    if (isMongoConnected) {
      try {
        const docs = await LogModel.find({}).sort({ timestamp: -1 }).limit(200).lean();
        if (docs && docs.length > 0) return docs as any[];
      } catch (err) {
        // Fallback
      }
    }
    return [...inMemoryLogs].reverse();
  },

  // Approvals
  async saveApproval(approval: ApprovalRequest): Promise<ApprovalRequest> {
    inMemoryApprovals.set(approval.id, { ...approval });
    if (isMongoConnected) {
      try {
        await ApprovalModel.findOneAndUpdate({ id: approval.id }, approval, { upsert: true });
      } catch (err) {
        // Fallback
      }
    }
    return approval;
  },

  async getApproval(id: string): Promise<ApprovalRequest | null> {
    const item = inMemoryApprovals.get(id);
    if (item) return { ...item };

    if (isMongoConnected) {
      try {
        const doc = await ApprovalModel.findOne({ id }).lean();
        if (doc) return doc as any;
      } catch (err) {
        // Fallback
      }
    }
    return null;
  },

  async listApprovals(): Promise<ApprovalRequest[]> {
    if (isMongoConnected) {
      try {
        const docs = await ApprovalModel.find({}).sort({ requestedAt: -1 }).lean();
        if (docs && docs.length > 0) return docs as any[];
      } catch (err) {
        // Fallback
      }
    }
    return Array.from(inMemoryApprovals.values()).sort(
      (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  },

  // Reports
  async saveReport(report: ReportMetadata): Promise<ReportMetadata> {
    inMemoryReports.set(report.id, { ...report });
    if (isMongoConnected) {
      try {
        await ReportModel.findOneAndUpdate({ id: report.id }, report, { upsert: true });
      } catch (err) {
        // Fallback
      }
    }
    return report;
  },

  async getReport(id: string): Promise<ReportMetadata | null> {
    const report = inMemoryReports.get(id);
    if (report) return { ...report };

    if (isMongoConnected) {
      try {
        const doc = await ReportModel.findOne({ id }).lean();
        if (doc) return doc as any;
      } catch (err) {
        // Fallback
      }
    }
    return null;
  },

  async getReportByTask(taskId: string): Promise<ReportMetadata | null> {
    for (const report of inMemoryReports.values()) {
      if (report.taskId === taskId) {
        return { ...report };
      }
    }

    if (isMongoConnected) {
      try {
        const doc = await ReportModel.findOne({ taskId }).lean();
        if (doc) return doc as any;
      } catch (err) {
        // Fallback
      }
    }
    return null;
  },

  getDbStatus() {
    return {
      connected: isMongoConnected,
      mode: isMongoConnected ? 'MongoDB Atlas (Connected)' : 'Resilient In-Memory Storage',
      taskCount: inMemoryTasks.size,
      logCount: inMemoryLogs.length
    };
  }
};
