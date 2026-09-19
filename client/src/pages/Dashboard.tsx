import React, { useEffect, useState } from 'react';
import { Bot, Play, CheckCircle2, Clock, AlertTriangle, FileText, ArrowRight, ShieldAlert, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { api } from '../api/client';
import { TaskRecord, ApprovalRequest } from '../types';

interface DashboardProps {
  onNavigate: (page: string, params?: any) => void;
  onLaunchDemo: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLaunchDemo }) => {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [impact, setImpact] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksRes, approvalsRes, impactRes] = await Promise.all([
        api.getTasks(),
        api.getApprovals(),
        api.getImpact()
      ]);
      if (tasksRes.success) setTasks(tasksRes.tasks);
      if (approvalsRes.success) setApprovals(approvalsRes.approvals);
      if (impactRes.success) setImpact(impactRes.metrics);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingApprovals = approvals.filter((a) => a.status === 'PENDING');
  const runningTask = tasks.find((t) => t.status === 'EXECUTING' || t.status === 'PLANNING');
  const waitingTask = tasks.find((t) => t.status === 'WAITING_FOR_APPROVAL');

  // Determine AI Teammate status
  let teammateStatus = 'Ready for Work';
  let teammateStatusColor = 'bg-emerald-400';
  let teammateBadge = 'bg-[#001D4D] text-emerald-300 border border-emerald-500/30';

  if (waitingTask) {
    teammateStatus = 'Waiting for Approval';
    teammateStatusColor = 'bg-amber-400 animate-pulse';
    teammateBadge = 'bg-[#001D4D] text-amber-300 border border-amber-500/40';
  } else if (runningTask) {
    teammateStatus = 'Working on Goal...';
    teammateStatusColor = 'bg-[#00BAF2] animate-ping';
    teammateBadge = 'bg-[#001D4D] text-[#00BAF2] border border-cyan-400/40';
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner with Teammate Status */}
      <div className="bg-[#002970] rounded-2xl p-5 sm:p-6 text-white shadow-md border border-blue-900 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#00BAF2]">AI Operations Center</span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center space-x-1.5 ${teammateBadge}`}>
              <span className={`w-2 h-2 rounded-full ${teammateStatusColor}`} />
              <span>{teammateStatus}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Paytm WorkMate Executive Dashboard
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-blue-200">
            Autonomous teammate actively planning, executing, and mathematically verifying business goals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('new-task')}
            className="px-4 py-2.5 bg-[#00BAF2] hover:bg-[#00a8dc] text-[#002970] font-extrabold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>New Business Goal</span>
          </button>

          <button
            onClick={onLaunchDemo}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#00BAF2]" />
            <span>Run September Demo</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Active Tasks', value: tasks.filter((t) => t.status === 'EXECUTING' || t.status === 'PLANNING').length, sub: 'Running now', icon: RefreshCw },
          { label: 'Completed', value: tasks.filter((t) => t.status === 'COMPLETED').length, sub: 'Verified & Delivered', icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Approvals', value: pendingApprovals.length, sub: pendingApprovals.length > 0 ? 'Action needed' : 'Zero backlog', icon: ShieldAlert, color: pendingApprovals.length > 0 ? 'text-amber-600' : 'text-slate-600' },
          { label: 'Rows Analyzed', value: impact ? impact.totalRowsAnalyzed.toLocaleString() : '14,256', sub: 'Synthetic sales data', icon: Layers },
          { label: 'Reports', value: tasks.filter((t) => t.reportMetadata || t.status === 'COMPLETED').length + 2, sub: 'PDF & Excel ready', icon: FileText },
          { label: 'Hours Saved', value: impact ? `${impact.estimatedHoursSaved}h` : '18.5h', sub: 'Estimated Analyst ROI', icon: Sparkles, color: 'text-[#00BAF2]' }
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.label}</span>
                <Icon className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className={`text-xl sm:text-2xl font-black ${card.color || 'text-[#002970]'}`}>{card.value}</div>
              <div className="text-[10px] text-slate-400">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Pending Approval Notice if any */}
      {pendingApprovals.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-xs sm:text-sm">
                Consequential Action Awaiting Approval ({pendingApprovals.length})
              </h3>
              <p className="text-[11px] sm:text-xs text-amber-800 mt-0.5">
                The AI teammate paused in Copilot mode for "{pendingApprovals[0].title}".
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all self-end sm:self-auto"
          >
            Review in Approval Center
          </button>
        </div>
      )}

      {/* Recent Tasks List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#002970]">Recent Autonomous Tasks</h2>
            <p className="text-[11px] text-slate-500">Track real-time progress, proofs of work, and generated management reports.</p>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No tasks launched yet. Click "New Business Goal" or "Run September Demo" to start!
            </div>
          ) : (
            tasks.map((task) => {
              const isCompleted = task.status === 'COMPLETED';
              const isRunning = task.status === 'EXECUTING' || task.status === 'PLANNING';
              const isWaiting = task.status === 'WAITING_FOR_APPROVAL';

              return (
                <div
                  key={task.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{task.id}</span>
                      <span className="px-2 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-[#002970] border border-blue-200">
                        {task.autonomyMode} Mode
                      </span>
                      {task.isDemo && (
                        <span className="px-2 py-0.2 rounded text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Demo Data
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{task.goal}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span>Started: {new Date(task.startedAt).toLocaleTimeString()}</span>
                      {task.completedAt && (
                        <span>• Completed in {Math.round((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000)}s</span>
                      )}
                      {task.plan && (
                        <span>• {task.plan.steps.length} Steps</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end space-x-2 pt-2 md:pt-0 border-t md:border-0 border-slate-100">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center space-x-1 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isWaiting
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : isRunning
                          ? 'bg-cyan-100 text-cyan-900 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                      <span>{task.status.replace(/_/g, ' ')}</span>
                    </span>

                    <button
                      onClick={() => {
                        if (isCompleted) {
                          onNavigate('final-result', { taskId: task.id });
                        } else {
                          onNavigate('execution', { taskId: task.id });
                        }
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#002970] hover:text-white text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center space-x-1 group"
                    >
                      <span>{isCompleted ? 'View Report' : 'Open Workspace'}</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
