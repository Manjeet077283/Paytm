import React, { useEffect, useState, useRef } from 'react';
import {
  Bot,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  FileText,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Layers,
  ListOrdered
} from 'lucide-react';
import { api } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { TaskRecord, TaskStep, ExecutionLog, ApprovalRequest } from '../types';

interface TaskExecutionPageProps {
  taskId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const TaskExecutionPage: React.FC<TaskExecutionPageProps> = ({ taskId, onNavigate }) => {
  const [task, setTask] = useState<TaskRecord | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(null);
  const [approving, setApproving] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [mobileTab, setMobileTab] = useState<'goal' | 'plan' | 'logs'>('plan');

  const { socket, setActiveTaskId, lastEvent } = useSocket();
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Set active task for socket room
  useEffect(() => {
    setActiveTaskId(taskId);
    return () => setActiveTaskId(null);
  }, [taskId]);

  // Initial fetch
  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const [taskRes, logsRes, approvalsRes] = await Promise.all([
        api.getTask(taskId),
        api.getTaskLogs(taskId),
        api.getApprovals()
      ]);

      if (taskRes.success) setTask(taskRes.task);
      if (logsRes.success) setLogs(logsRes.logs);
      if (approvalsRes.success) {
        const pending = approvalsRes.approvals.find((a) => a.taskId === taskId && a.status === 'PENDING');
        if (pending) {
          setActiveApproval(pending);
          setMobileTab('logs'); // Switch to logs so user sees the approval prompt immediately
        }
      }
    } catch (err) {
      console.error('Error fetching task details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  // Handle live incoming Socket.IO events
  useEffect(() => {
    if (!lastEvent || !lastEvent.payload) return;
    const { event, payload } = lastEvent;

    if (payload.taskId !== taskId) return;

    if (event === 'TASK_STARTED' || event === 'TASK_COMPLETED' || event === 'TASK_FAILED') {
      setTask((prev) => (prev ? { ...prev, ...payload.task, status: payload.task?.status || prev.status } : null));
    } else if (event === 'STEP_STARTED') {
      setTask((prev) => {
        if (!prev || !prev.plan) return prev;
        const updatedSteps = prev.plan.steps.map((s) =>
          s.id === payload.step.id ? { ...s, status: 'RUNNING' as const, startedAt: new Date().toISOString() } : s
        );
        return { ...prev, plan: { ...prev.plan, steps: updatedSteps } };
      });
    } else if (event === 'STEP_COMPLETED') {
      setTask((prev) => {
        if (!prev || !prev.plan) return prev;
        const updatedSteps = prev.plan.steps.map((s) =>
          s.id === payload.step.id
            ? {
                ...s,
                status: 'COMPLETED' as const,
                completedAt: new Date().toISOString(),
                outputSummary: payload.step?.outputSummary || 'Completed'
              }
            : s
        );
        return { ...prev, plan: { ...prev.plan, steps: updatedSteps } };
      });
    } else if (event === 'APPROVAL_REQUESTED') {
      setActiveApproval(payload.approval);
      setTask((prev) => (prev ? { ...prev, status: 'WAITING_FOR_APPROVAL' } : null));
      setMobileTab('logs');
    } else if (event === 'LOG_EMITTED') {
      setLogs((prev) => {
        if (prev.some((l) => l.id === payload.log.id)) return prev;
        return [...prev, payload.log];
      });
    }
  }, [lastEvent, taskId]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleApprove = async () => {
    if (!activeApproval) return;
    try {
      setApproving(true);
      await api.approveAction(activeApproval.id, approvalComments || 'Approved by operator to execute.');
      setActiveApproval(null);
      setTask((prev) => (prev ? { ...prev, status: 'EXECUTING' } : null));
    } catch (err) {
      console.error('Approval failed:', err);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!activeApproval) return;
    try {
      setApproving(true);
      await api.rejectAction(activeApproval.id, approvalComments || 'Rejected by operator.');
      setActiveApproval(null);
      setTask((prev) => (prev ? { ...prev, status: 'FAILED' } : null));
    } catch (err) {
      console.error('Rejection failed:', err);
    } finally {
      setApproving(false);
    }
  };

  if (loading && !task) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#002970] border-t-transparent mb-4" />
        <p className="text-slate-600 font-medium">Connecting to Autonomous Workspace...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Task Not Found</h2>
        <p className="text-slate-500 text-xs mt-1">The requested task ID does not exist.</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-4 px-4 py-2 bg-[#002970] text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const isCompleted = task.status === 'COMPLETED';
  const isWaiting = task.status === 'WAITING_FOR_APPROVAL';
  const isExecuting = task.status === 'EXECUTING' || task.status === 'PLANNING';
  const steps = task.plan?.steps || [];
  const completedStepsCount = steps.filter((s) => s.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      {/* Top Banner with Progress Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#002970] flex items-center justify-center text-[#00BAF2] shadow-sm flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-slate-900 text-base sm:text-lg">Autonomous Execution Workspace</span>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {task.id}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Live Socket.IO Stream • Deterministic Ground-Truth Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 self-end sm:self-auto">
          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1.5 ${
              isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : isWaiting
                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                : isExecuting
                ? 'bg-cyan-100 text-cyan-900 border border-cyan-300 animate-pulse'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
            <span>{task.status.replace(/_/g, ' ')}</span>
          </span>

          {/* View Report Button */}
          {isCompleted && (
            <button
              onClick={() => onNavigate('final-result', { taskId: task.id })}
              className="px-3.5 py-1.5 bg-[#002970] hover:bg-[#001D4D] text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-[#00BAF2]" />
              <span>View Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Tab Switcher (< lg) */}
      <div className="lg:hidden flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm text-xs font-bold">
        <button
          onClick={() => setMobileTab('plan')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            mobileTab === 'plan' ? 'bg-[#002970] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
          <span>Execution Plan ({completedStepsCount}/{steps.length})</span>
        </button>

        <button
          onClick={() => setMobileTab('logs')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all relative ${
            mobileTab === 'logs' ? 'bg-[#002970] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Live Logs ({logs.length})</span>
          {activeApproval && (
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute top-1.5 right-2 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setMobileTab('goal')}
          className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
            mobileTab === 'goal' ? 'bg-[#002970] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Goal & Policy</span>
        </button>
      </div>

      {/* THREE-COLUMN ENTERPRISE WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Business Goal & Governance (3 Cols) */}
        {/* ============================================================ */}
        <div className={`lg:col-span-3 space-y-4 ${mobileTab !== 'goal' ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Business Goal
              </span>
              <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-900 leading-relaxed">
                "{task.goal}"
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Autonomy Mode:</span>
                <span className="font-bold px-2 py-0.5 rounded bg-blue-50 text-[#002970] border border-blue-200 text-[11px]">
                  {task.autonomyMode}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Steps Progress:</span>
                <span className="font-bold text-slate-800">
                  {completedStepsCount} / {steps.length}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Dataset Source:</span>
                <span className="font-mono text-[11px] text-slate-700">{task.datasetFilename}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Started At:</span>
                <span className="text-slate-700">{new Date(task.startedAt).toLocaleTimeString()}</span>
              </div>

              {task.completedAt && (
                <div className="flex justify-between items-center text-emerald-700 font-semibold">
                  <span>Delivered At:</span>
                  <span>{new Date(task.completedAt).toLocaleTimeString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero Hallucination Guarantee: Mathematical cross-check.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER COLUMN: Visible Execution Plan (4 Cols) */}
        {/* ============================================================ */}
        <div className={`lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4 ${mobileTab !== 'plan' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-[#002970]">Structured Execution Plan</h3>
              <p className="text-[11px] text-slate-500">Sequential, verified steps</p>
            </div>
            <span className="text-xs font-black text-[#002970] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {Math.round((completedStepsCount / (steps.length || 1)) * 100)}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#002970] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((completedStepsCount / (steps.length || 1)) * 100)}%` }}
            />
          </div>

          {/* Steps Checklist */}
          <div className="space-y-2">
            {steps.map((step) => {
              const isStepDone = step.status === 'COMPLETED';
              const isStepActive = step.status === 'RUNNING';
              const isStepFailed = step.status === 'FAILED';

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isStepDone
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : isStepActive
                      ? 'bg-blue-50/80 border-[#00BAF2] shadow-sm ring-1 ring-[#00BAF2]'
                      : isStepFailed
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-slate-50/60 border-slate-200/70 opacity-70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5 flex-shrink-0">
                        {isStepDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isStepActive ? (
                          <div className="w-4 h-4 rounded-full border-2 border-[#002970] border-t-transparent animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {step.order}. {step.title}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{step.description}</p>
                      </div>
                    </div>

                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-white text-slate-700 font-semibold border border-slate-200 whitespace-nowrap">
                      {step.tool}
                    </span>
                  </div>

                  {step.outputSummary && (
                    <div className="mt-2 text-[10px] text-emerald-800 font-medium bg-emerald-100/60 px-2 py-0.5 rounded">
                      ✓ {step.outputSummary}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Live Activity Terminal & Proof Canvas (5 Cols) */}
        {/* ============================================================ */}
        <div className={`lg:col-span-5 space-y-4 ${mobileTab !== 'logs' ? 'hidden lg:block' : 'block'}`}>
          {/* INTERACTIVE APPROVAL BANNER (Copilot Mode) */}
          {activeApproval && (
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
              <div className="flex items-center space-x-2 text-amber-950 font-bold text-xs sm:text-sm">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>Action Requires Human Authorization</span>
                <span className="ml-auto text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  Risk: {activeApproval.riskLevel}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-1.5 text-slate-700">
                <p className="font-bold text-slate-900">{activeApproval.title}</p>
                <p className="text-[11px] text-slate-600">{activeApproval.reason}</p>
                <div className="text-[11px] text-amber-900 font-semibold pt-1">
                  <strong>Expected Consequential Action:</strong> {activeApproval.expectedAction}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Optional operator notes or justification..."
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] bg-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={handleReject}
                  disabled={approving}
                  className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all"
                >
                  Reject Action
                </button>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{approving ? 'Authorizing...' : 'Approve & Continue'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Paytm Enterprise Developer Terminal */}
          <div className="bg-[#001D4D] rounded-2xl shadow-md border border-[#002970] overflow-hidden flex flex-col h-[460px] sm:h-[520px]">
            <div className="px-4 py-2.5 bg-[#001538] border-b border-blue-900/80 flex items-center justify-between text-xs text-blue-200 font-mono">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-[#00BAF2]" />
                <span className="font-bold text-white text-[11px]">PROOF-OF-WORK CONSOLE</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-blue-200">STREAMING</span>
              </div>
            </div>

            <div className="p-3.5 overflow-y-auto font-mono text-[11px] leading-relaxed space-y-2 flex-1 text-slate-300">
              {logs.length === 0 ? (
                <div className="text-blue-300/60 italic py-10 text-center font-sans text-xs">
                  Awaiting initial tool execution payloads...
                </div>
              ) : (
                logs.map((log, idx) => {
                  const isSuccess = log.status === 'SUCCESS';
                  const isWarning = log.status === 'WARNING';
                  const isError = log.status === 'ERROR';

                  return (
                    <div key={idx} className="flex items-start space-x-2 group">
                      <span className="text-blue-300/60 text-[10px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase whitespace-nowrap ${
                          isSuccess
                            ? 'text-emerald-300 bg-emerald-950/60 border border-emerald-800/40'
                            : isWarning
                            ? 'text-amber-300 bg-amber-950/60 border border-amber-800/40'
                            : isError
                            ? 'text-rose-300 bg-rose-950/60 border border-rose-800/40'
                            : 'text-[#00BAF2] bg-blue-950/60 border border-blue-800/40'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="text-slate-200">{log.details}</span>
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>

            {/* Terminal Footer */}
            <div className="px-4 py-2 bg-[#001538] border-t border-blue-900/80 flex items-center justify-between text-[10px] font-mono text-blue-300/70">
              <span>Paytm Ground-Truth Verification</span>
              <span>Events: {logs.length}</span>
            </div>
          </div>

          {/* Completed Banner */}
          {isCompleted && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">Work Completed With Proof</h4>
                  <p className="text-[11px] text-emerald-800">
                    Finished executive report, PDF, and Excel ready.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('final-result', { taskId: task.id })}
                className="px-4 py-2 bg-[#002970] hover:bg-[#001D4D] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1"
              >
                <span>Open Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
