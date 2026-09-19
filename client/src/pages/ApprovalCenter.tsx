import React, { useEffect, useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import { ApprovalRequest } from '../types';

interface ApprovalCenterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const ApprovalCenter: React.FC<ApprovalCenterProps> = ({ onNavigate }) => {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState<{ [id: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await api.getApprovals();
      if (res.success) setApprovals(res.approvals);
    } catch (err) {
      console.error('Failed to load approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      const comments = commentInput[id] || 'Approved by operator';
      await api.approveAction(id, comments);
      await fetchApprovals();
    } catch (err) {
      console.error('Error approving action:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(id);
      const comments = commentInput[id] || 'Rejected by operator';
      await api.rejectAction(id, comments);
      await fetchApprovals();
    } catch (err) {
      console.error('Error rejecting action:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const pending = approvals.filter((a) => a.status === 'PENDING');
  const history = approvals.filter((a) => a.status !== 'PENDING');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold mb-3 tracking-wide">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
          <span>GOVERNANCE & HUMAN AUTHORIZATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002970] tracking-tight">
          Approval Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          WorkMate pauses before executing consequential actions. Review, add notes, and authorize.
        </p>
      </div>

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>Pending Authorizations</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {pending.length}
            </span>
          </h2>
          <button
            onClick={fetchApprovals}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center text-slate-500 text-xs sm:text-sm">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-slate-800 text-base">All clear! No pending approvals.</p>
            <p className="mt-1 text-slate-500 text-xs max-w-md mx-auto">
              When an agent reaches a high-risk policy threshold in Copilot mode, it will pause and appear here for your review.
            </p>
          </div>
        ) : (
          pending.map((appr) => (
            <div
              key={appr.id}
              className="bg-white rounded-2xl border border-amber-300 shadow-sm p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-400">{appr.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-200">
                      Risk Level: {appr.riskLevel}
                    </span>
                    <span className="text-xs text-slate-500">
                      Task: <strong className="text-slate-800">{appr.taskId}</strong>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">{appr.title}</h3>
                </div>

                <button
                  onClick={() => onNavigate('execution', { taskId: appr.taskId })}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
                >
                  <span>Open Task</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 text-xs space-y-2 text-slate-800">
                <p>
                  <strong>Reason:</strong> {appr.reason}
                </p>
                <p>
                  <strong>Affected Entity:</strong> {appr.affectedEntity}
                </p>
                <p className="text-amber-950 font-bold">
                  <strong>Proposed Consequential Action:</strong> {appr.expectedAction}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Optional operator notes (e.g. Authorized under September emergency budget)..."
                  value={commentInput[appr.id] || ''}
                  onChange={(e) =>
                    setCommentInput({ ...commentInput, [appr.id]: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00BAF2]"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                <button
                  onClick={() => handleReject(appr.id)}
                  disabled={actionLoading === appr.id}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl transition-all text-center"
                >
                  Reject Action
                </button>
                <button
                  onClick={() => handleApprove(appr.id)}
                  disabled={actionLoading === appr.id}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{actionLoading === appr.id ? 'Authorizing...' : 'Approve & Resume Task'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Historical Approvals Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Historical Decisions</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">No historical approvals yet.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {history.map((appr) => (
                <div key={appr.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{appr.title}</span>
                      <span className="font-mono text-[10px] text-slate-400">{appr.id}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">Notes: {appr.comments || 'No comments'}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                      appr.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {appr.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
