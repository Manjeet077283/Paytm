import React, { useState } from 'react';
import { Bot, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('executive@paytm.com');
  const [password, setPassword] = useState('paytm123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pre-authorized executive login for hackathon demo
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#002970] text-[#00BAF2] flex items-center justify-center mx-auto shadow-sm">
            <Bot className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-2xl font-black text-[#002970] tracking-tight">paytm</span>
            <span className="text-2xl font-bold text-[#00BAF2] tracking-tight">workmate</span>
          </div>
          <p className="text-xs text-slate-500">Autonomous AI Teammates • Enterprise Sign In</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-[#00BAF2]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-[#00BAF2]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#002970] hover:bg-[#001D4D] text-white font-bold text-xs rounded-xl shadow-md shadow-[#002970]/15 transition-all flex items-center justify-center space-x-2"
          >
            <span>Sign In to Workspace</span>
            <ArrowRight className="w-4 h-4 text-[#00BAF2]" />
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center">
          <button
            onClick={onLoginSuccess}
            className="w-full py-2.5 bg-[#F4F8FC] hover:bg-[#E8F6FD] text-[#002970] border border-[#BDE3F9] font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#00BAF2]" />
            <span>1-Click Sign In as Executive (Judge Demo)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
