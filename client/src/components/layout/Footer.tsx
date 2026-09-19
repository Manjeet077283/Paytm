import React from 'react';
import { ShieldCheck, Cpu, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-[#002970]">Paytm WorkMate</span>
          <span>•</span>
          <span className="text-slate-600 font-medium">"From Prompt to Done."</span>
          <span>•</span>
          <span className="text-slate-400">Autonomous AI Teammates Hackathon Track</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Deterministic Ground-Truth Verification</span>
          </div>
          <div className="flex items-center space-x-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
            <Cpu className="w-3.5 h-3.5" />
            <span>Node.js Monolith Core</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 text-center sm:text-left text-[11px] text-slate-400">
        Demo dataset — synthetic data generated for merchant business scenarios. No access claimed to real private Paytm merchant credentials or production databases.
      </div>
    </footer>
  );
};
