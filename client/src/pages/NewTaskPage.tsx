import React, { useState } from 'react';
import { Bot, Play, Sparkles, Upload, FileText, CheckCircle2, Shield, ArrowRight, Layers } from 'lucide-react';
import { api } from '../api/client';
import { AutonomyMode } from '../types';

interface NewTaskPageProps {
  onNavigate: (page: string, params?: any) => void;
  defaultGoal?: string;
}

export const NewTaskPage: React.FC<NewTaskPageProps> = ({ onNavigate, defaultGoal }) => {
  const [goal, setGoal] = useState(
    defaultGoal || 'Analyze September sales, identify the biggest business issues and prepare a management report.'
  );
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>('Copilot');
  const [datasetFilename, setDatasetFilename] = useState<string>('sales.csv');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templates = [
    {
      title: 'Analyze September Sales (Primary MVP)',
      goal: 'Analyze September sales, identify the biggest business issues and prepare a management report.',
      badge: 'Recommended Demo',
      color: 'border-[#00BAF2] bg-[#F4F8FC] text-[#002970] shadow-sm'
    },
    {
      title: 'Customer Retention & Churn Audit',
      goal: 'Evaluate returning vs new customer sales contribution, analyze ticket sizes, and highlight merchant churn risks.',
      badge: 'Customer MIS',
      color: 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
    },
    {
      title: 'Hardware POS & Soundbox Margin Review',
      goal: 'Audit device sales volume, detect discount margin leakages, and identify underperforming accessories.',
      badge: 'Financial Audit',
      color: 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
    },
    {
      title: 'Payment Gateway Downtime & Failure Spikes',
      goal: 'Detect abnormal payment failure spikes across merchant terminals and generate failover routing recommendations.',
      badge: 'Operations',
      color: 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
    }
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadMessage(null);
      const res = await api.uploadCsv(file);
      if (res.success) {
        setUploadedFileName(file.name);
        setDatasetFilename(res.filename);
        setUploadMessage(`Successfully validated ${res.rowCount} rows.`);
      } else {
        setUploadMessage('Upload failed: Please ensure valid CSV structure.');
      }
    } catch (err) {
      setUploadMessage('Error uploading file. Using default synthetic data.');
    } finally {
      setUploading(false);
    }
  };

  const handleLaunchTask = async () => {
    if (!goal.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await api.createTask({
        goal: goal.trim(),
        autonomyMode,
        isDemo: !uploadedFileName,
        datasetFilename
      });

      if (res.success) {
        // Immediately start execution and navigate to the 3-column workspace
        await api.runTask(res.task.id);
        onNavigate('execution', { taskId: res.task.id });
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Title */}
      <div className="mb-6 sm:mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E8F6FD] border border-[#BDE3F9] text-[#002970] text-xs font-bold mb-3 tracking-wide">
          <Bot className="w-3.5 h-3.5 text-[#00BAF2]" />
          <span>AUTONOMOUS AI TEAMMATE DISPATCH</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#002970] tracking-tight">
          What do you want your teammate to accomplish?
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Provide an outcome-based business goal. WorkMate plans required steps, selects authorized tools, detects anomalies, and delivers a completed management report.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-6 sm:space-y-8">
        {/* Goal Input Field */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
            Target Business Goal
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Analyze September sales, identify the biggest business issues and prepare a management report."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-[#00BAF2] focus:ring-4 focus:ring-cyan-50 text-slate-900 font-medium text-sm sm:text-base outline-none transition-all placeholder:text-slate-400 leading-relaxed"
            />
          </div>
        </div>

        {/* Quick Goal Presets */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Quick Business Scenarios & Templates
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map((tpl, idx) => (
              <div
                key={idx}
                onClick={() => setGoal(tpl.goal)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:border-[#00BAF2] hover:shadow-sm ${tpl.color}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs sm:text-sm">{tpl.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/90 border border-slate-200 text-slate-700">
                    {tpl.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{tpl.goal}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Autonomy Mode Selector */}
        <div>
          <label className="block text-xs sm:text-sm font-bold text-slate-900 mb-2">
            Autonomy Mode Governance
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              {
                mode: 'Assist' as AutonomyMode,
                title: 'Assist Mode',
                desc: 'AI analyzes and recommends. Human confirms every discrete operational step.',
                badge: 'Guided Review'
              },
              {
                mode: 'Copilot' as AutonomyMode,
                title: 'Copilot Mode (Default)',
                desc: 'AI prepares the entire work and pauses for human authorization before consequential actions.',
                badge: 'Recommended'
              },
              {
                mode: 'Autonomous' as AutonomyMode,
                title: 'Autonomous Mode',
                desc: 'Low-risk pre-approved actions and verification execute end-to-end automatically.',
                badge: 'Full Velocity'
              }
            ].map((item) => {
              const isSelected = autonomyMode === item.mode;
              return (
                <div
                  key={item.mode}
                  onClick={() => setAutonomyMode(item.mode)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#002970] bg-[#F4F8FC] shadow-sm ring-2 ring-[#002970]/15'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{item.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isSelected ? 'bg-[#002970] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Source Configuration */}
        <div className="border-t border-slate-100 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <label className="text-sm font-bold text-slate-900 block">Dataset Source</label>
              <p className="text-xs text-slate-500">
                {uploadedFileName ? `Custom uploaded CSV: ${uploadedFileName}` : 'Pre-seeded synthetic enterprise dataset (sales.csv: 3,564 records)'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <label className="cursor-pointer px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center space-x-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Validating...' : 'Upload Custom CSV'}</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              {uploadedFileName && (
                <button
                  onClick={() => {
                    setUploadedFileName(null);
                    setDatasetFilename('sales.csv');
                    setUploadMessage(null);
                  }}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Reset to Demo Data
                </button>
              )}
            </div>
          </div>
          {uploadMessage && (
            <p className="mt-2 text-xs text-emerald-600 font-medium">{uploadMessage}</p>
          )}
        </div>

        {/* Launch Execution CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500 flex items-center space-x-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Independent calculation engine will verify all metrics before completion.</span>
          </div>

          <button
            onClick={handleLaunchTask}
            disabled={isSubmitting || !goal.trim()}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all ${
              isSubmitting || !goal.trim()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-[#002970] hover:bg-[#001D4D] text-white shadow-blue-900/20 transform hover:-translate-y-0.5'
            }`}
          >
            <Play className="w-4 h-4 fill-current text-[#00BAF2]" />
            <span>{isSubmitting ? 'Formulating Plan & Launching...' : 'Launch Autonomous Teammate'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
