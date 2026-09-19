import React from 'react';
import { Bot, ArrowRight, Play, CheckCircle2, ShieldCheck, FileSpreadsheet, Lock, Activity, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string, params?: any) => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onLaunchDemo }) => {
  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-18 lg:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Hackathon Track Tag */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#002970] text-xs font-bold mb-5 tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00BAF2]" />
            <span>Autonomous AI Teammates</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#002970] tracking-tight leading-tight max-w-3xl mx-auto">
            Meet Your <span className="text-[#00BAF2]">AI Teammate</span>.
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
            Give it a business goal. It plans, executes authorized tools, verifies numbers against raw data, and delivers completed management reports.
          </p>

          {/* Executive Tagline Banner */}
          <div className="mt-4 max-w-xl mx-auto px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs text-slate-600">
            <strong className="text-[#002970]">Paytm WorkMate</strong> turns high-level business intent into finished outcomes with full proof of work.
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
            <button
              onClick={() => onNavigate('new-task')}
              className="w-full sm:w-auto px-6 py-3 bg-[#002970] hover:bg-[#001D4D] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 group"
            >
              <span>Try AI Teammate</span>
              <ArrowRight className="w-4 h-4 text-[#00BAF2] group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onLaunchDemo}
              className="w-full sm:w-auto px-6 py-3 bg-[#00BAF2] hover:bg-[#00a8dc] text-[#002970] font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-[#002970]" />
              <span>Load Demo Scenario</span>
            </button>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 font-medium">
            Demo Scenario: "Analyze September sales, identify the biggest business issues and prepare a management report."
          </p>

          {/* Stepped Execution Architecture (Authentic Paytm Stepper) */}
          <div className="mt-12 max-w-4xl mx-auto bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm text-left">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#002970]">
                Autonomous Execution Pipeline
              </span>
              <span className="text-[11px] font-semibold text-[#00BAF2] bg-blue-50 px-2 py-0.5 rounded-full">
                Zero Hallucination
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { step: '01', title: 'User Goal', desc: 'Natural prompt' },
                { step: '02', title: 'Planner', desc: 'Step breakdown' },
                { step: '03', title: 'Tools', desc: '10 gated tools' },
                { step: '04', title: 'Analysis', desc: 'Deterministic math' },
                { step: '05', title: 'Verify', desc: 'Raw ground-truth' },
                { step: '06', title: 'Report', desc: 'PDF & Excel done' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-[#00BAF2] transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#002970] text-[#00BAF2] flex items-center justify-center text-[10px] font-black mb-1.5">
                    {idx + 1}
                  </div>
                  <div className="font-bold text-xs text-slate-900 leading-tight">{item.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="py-14 bg-white border-y border-slate-200/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00BAF2]">Core Differentiators</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#002970] mt-1">
              Built Around Execution, Not Just Chat
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              WorkMate turns conversational intent into finished enterprise artifacts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: TrendingUp,
                title: 'Outcome-Based',
                desc: 'Assign comprehensive business objectives. WorkMate owns the execution cycle from raw data to final report delivery.'
              },
              {
                icon: Lock,
                title: 'Controlled Autonomy',
                desc: 'Choose Assist, Copilot, or Autonomous governance. High-consequence decisions pause for human approval in the Approval Center.'
              },
              {
                icon: Activity,
                title: 'Proof of Work',
                desc: 'Chronological audit ledger stores tool inputs, outputs, timestamps, and cryptographic proof hashes for full compliance.'
              },
              {
                icon: ShieldCheck,
                title: 'Verified Results',
                desc: 'Never relies on the LLM for numerical truth. An independent calculation engine cross-verifies every rupee against raw disk data.'
              }
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#F7FAFC] border border-slate-200/90 hover:border-[#00BAF2] hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-[#002970] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-[#002970]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Realistic Workspace Preview Section */}
      <section className="py-14 bg-[#F7FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-[#002970]">
              Live 3-Column Execution Workspace
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Watch your AI teammate work step-by-step with real-time Socket.IO updates.
            </p>
          </div>

          <div className="bg-[#002970] rounded-2xl shadow-xl p-4 sm:p-5 border border-blue-900 text-left">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-3 border-b border-blue-900/80 mb-4 px-1">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-blue-200 font-semibold ml-2">Paytm WorkMate Terminal</span>
              </div>
              <div className="text-[11px] text-[#00BAF2] font-mono font-bold">AUTONOMOUS RUNNER ACTIVE</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Col 1 */}
              <div className="bg-[#001D4D] p-3 rounded-xl border border-blue-900/60 space-y-2">
                <div className="text-blue-300 font-bold text-[11px] uppercase tracking-wider">Target Goal</div>
                <div className="text-white bg-[#002970] p-2.5 rounded-lg text-xs leading-relaxed font-medium">
                  "Analyze September sales, identify the biggest business issues and prepare a management report."
                </div>
                <div className="text-[11px] text-[#00BAF2] font-semibold">Mode: Copilot</div>
                <div className="text-[10px] text-blue-300">Dataset: sales.csv (3,564 txns)</div>
              </div>

              {/* Col 2 */}
              <div className="bg-[#001D4D] p-3 rounded-xl border border-blue-900/60 space-y-1.5">
                <div className="text-blue-300 font-bold text-[11px] uppercase tracking-wider mb-2">Execution Plan</div>
                <div className="space-y-1 text-[11px]">
                  <div className="text-emerald-400 flex items-center space-x-1.5 font-medium">
                    <span>✓</span> <span>01. Understand objective</span>
                  </div>
                  <div className="text-emerald-400 flex items-center space-x-1.5 font-medium">
                    <span>✓</span> <span>02. Load sales dataset</span>
                  </div>
                  <div className="text-emerald-400 flex items-center space-x-1.5 font-medium">
                    <span>✓</span> <span>03. Validate dataset schema</span>
                  </div>
                  <div className="text-[#00BAF2] flex items-center space-x-1.5 font-bold animate-pulse">
                    <span>→</span> <span>04. Analyze sales & GMV</span>
                  </div>
                  <div className="text-blue-300/60 flex items-center space-x-1.5">
                    <span>○</span> <span>05. Detect anomalies</span>
                  </div>
                  <div className="text-blue-300/60 flex items-center space-x-1.5">
                    <span>○</span> <span>06. Independently verify</span>
                  </div>
                  <div className="text-blue-300/60 flex items-center space-x-1.5">
                    <span>○</span> <span>07. Export PDF & Excel</span>
                  </div>
                </div>
              </div>

              {/* Col 3 */}
              <div className="bg-[#001D4D] p-3 rounded-xl border border-blue-900/60 space-y-1.5 font-mono text-[11px]">
                <div className="text-blue-300 font-bold uppercase tracking-wider mb-2 font-sans">Live Proof of Work</div>
                <div className="text-blue-100 space-y-1">
                  <div>[12:20:10] Connected to sales.csv</div>
                  <div>[12:20:11] 3,564 records validated</div>
                  <div className="text-amber-300">[12:20:13] Anomaly: Revenue drop on Sep 18</div>
                  <div className="text-emerald-400">[12:20:14] Check: ₹11,706,170.30 PASSED</div>
                  <div className="text-[#00BAF2]">[12:20:15] PDF & Excel ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
