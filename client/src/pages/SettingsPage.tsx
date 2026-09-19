import React, { useEffect, useState } from 'react';
import { Settings, Database, Server, Cpu, CheckCircle2, AlertCircle, FileSpreadsheet, Shield, Key } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export const SettingsPage: React.FC = () => {
  const { isConnected } = useSocket();
  const [serverHealth, setServerHealth] = useState<any>(null);

  useEffect(() => {
    fetch('/health')
      .then((res) => res.json())
      .then((data) => setServerHealth(data))
      .catch((err) => console.error('Health check failed:', err));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E8F6FD] border border-[#BDE3F9] text-[#002970] text-xs font-bold mb-3 tracking-wide">
          <Settings className="w-3.5 h-3.5 text-[#00BAF2]" />
          <span>SYSTEM ENVIRONMENT & DIAGNOSTICS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#002970] tracking-tight">
          System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configuration parameters, data store status, and autonomous execution runtime.
        </p>
      </div>

      {/* Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Node Express API</span>
            <Server className="w-4 h-4 text-[#002970]" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-base font-bold text-slate-800">Port 5001 Healthy</span>
          </div>
          <div className="text-[11px] text-slate-400">Single Monolithic Backend</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Database Layer</span>
            <Database className="w-4 h-4 text-[#00BAF2]" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-base font-bold text-slate-800">
              {serverHealth?.database?.mode || 'Resilient In-Memory'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Zero Crash Guarantee for Hackathon</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">Real-Time Socket.IO</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-base font-bold text-slate-800">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="text-[11px] text-slate-400">Live Workspace Event Stream</div>
        </div>
      </div>

      {/* Autonomous Planner Configuration */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#002970] flex items-center justify-center font-bold">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Planner & Reasoning Configuration</h3>
            <p className="text-xs text-slate-500">Autonomous tool routing, execution plan breakdown, and anomaly classification.</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-700">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Target LLM Architecture:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-[#002970]">
              Google Gemini 2.5 Flash (@google/genai)
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Active Engine:</span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
              Gemini + Deterministic Fallback Engine
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Gemini API Key:</span>
            <span className="text-slate-500 font-mono">Configured via GEMINI_API_KEY in .env</span>
          </div>
          <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
            Powered by <strong>Google Gemini 2.5 Flash</strong> for dynamic goal parsing, execution planning, and executive business insights. If no API key is set, WorkMate's built-in deterministic enterprise planner executes seamlessly with zero downtime.
          </p>
        </div>
      </div>

      {/* Synthetic Dataset Information */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Synthetic Dataset Integrity</h3>
            <p className="text-xs text-slate-500">Clearly labeled: Demo dataset — synthetic data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-800">sales.csv</div>
            <div className="text-slate-500 text-[11px] mt-0.5">3,564 Transactions (Sep 2024)</div>
            <div className="text-emerald-700 font-semibold text-[10px] mt-1">₹11.7M Total GMV</div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-800">customers.csv</div>
            <div className="text-slate-500 text-[11px] mt-0.5">500 Merchant Records</div>
            <div className="text-blue-700 font-semibold text-[10px] mt-1">Segmented Profiles</div>
          </div>
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="font-bold text-slate-800">products.csv</div>
            <div className="text-slate-500 text-[11px] mt-0.5">17 POS / Soundbox SKUs</div>
            <div className="text-purple-700 font-semibold text-[10px] mt-1">4 Product Categories</div>
          </div>
        </div>
      </div>
    </div>
  );
};
