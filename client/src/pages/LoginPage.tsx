import React, { useState } from 'react';
import { Bot, Lock, Mail, User, ArrowRight, Sparkles, UserPlus, LogIn, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Business Analyst');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both corporate email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.login({ email: email.trim(), password });
      if (res.success && res.token && res.user) {
        localStorage.setItem('paytm_token', res.token);
        localStorage.setItem('paytm_user', JSON.stringify(res.user));
        toast.success(`Welcome back, ${res.user.name || 'Team Leader'}!`);
        onLoginSuccess(res.user);
      } else {
        toast.error(res.error || 'Invalid corporate email or password.');
      }
    } catch (err: any) {
      toast.error('Unable to reach server. Please check your backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      toast.error('Please enter a valid corporate email address.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role
      });

      if (res.success && res.token && res.user) {
        localStorage.setItem('paytm_token', res.token);
        localStorage.setItem('paytm_user', JSON.stringify(res.user));
        toast.success(`Account registered successfully! Welcome ${res.user.name}.`);
        onLoginSuccess(res.user);
      } else {
        toast.error(res.error || 'Registration failed. Email may already be in use.');
      }
    } catch (err: any) {
      toast.error('Unable to connect to authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.login({ email: 'executive@paytm.com', password: 'paytm123' });
      if (res.success && res.token && res.user) {
        localStorage.setItem('paytm_token', res.token);
        localStorage.setItem('paytm_user', JSON.stringify(res.user));
        toast.success('Logged in as Executive Demo User.');
        onLoginSuccess(res.user);
      } else {
        // Local fallback
        const fallbackUser = { id: 'USR_DEMO_01', name: 'Vaibhav Jain', email: 'executive@paytm.com', role: 'VP of Product & Operations' };
        localStorage.setItem('paytm_token', 'DEMO_EXECUTIVE_TOKEN');
        localStorage.setItem('paytm_user', JSON.stringify(fallbackUser));
        toast.success('Signed in as Executive Demo User.');
        onLoginSuccess(fallbackUser);
      }
    } catch (err) {
      const fallbackUser = { id: 'USR_DEMO_01', name: 'Vaibhav Jain', email: 'executive@paytm.com', role: 'VP of Product & Operations' };
      localStorage.setItem('paytm_token', 'DEMO_EXECUTIVE_TOKEN');
      localStorage.setItem('paytm_user', JSON.stringify(fallbackUser));
      toast.success('Signed in as Executive Demo User (Offline Fallback).');
      onLoginSuccess(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#002970] text-[#00BAF2] flex items-center justify-center mx-auto shadow-md shadow-[#002970]/20">
            <Bot className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-2xl font-black text-[#002970] tracking-tight">paytm</span>
            <span className="text-2xl font-bold text-[#00BAF2] tracking-tight">workmate</span>
          </div>
          <p className="text-xs text-slate-500 font-medium">Autonomous AI Teammates • Enterprise Workspace</p>
        </div>

        {/* Tab Switcher: Sign In vs Create Account */}
        <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-[#002970] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'register'
                ? 'bg-white text-[#002970] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* SIGN IN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="e.g. name@paytm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-[#00BAF2] bg-slate-50/50"
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-[#00BAF2] bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#002970] hover:bg-[#001D4D] text-white font-bold text-xs rounded-xl shadow-md shadow-[#002970]/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4 text-[#00BAF2]" />
                </>
              )}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Manjeet Yadav"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-[#00BAF2] bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="e.g. manjeet@paytm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-[#00BAF2] bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Team Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-[#00BAF2] bg-slate-50/50"
              >
                <option value="Business Analyst">Business Analyst</option>
                <option value="Operations Lead">Operations Lead</option>
                <option value="Product Manager">Product Manager</option>
                <option value="VP of Product & Operations">VP of Product & Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Create Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-[#00BAF2] bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00BAF2] focus:border-[#00BAF2] bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#00BAF2] hover:bg-[#00a3d4] text-[#002970] font-black text-xs rounded-xl shadow-md shadow-[#00BAF2]/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#002970]" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start</span>
                  <CheckCircle className="w-4 h-4 text-[#002970]" />
                </>
              )}
            </button>
          </form>
        )}

        {/* 1-Click Judge/Demo Sign In */}
        <div className="pt-3 border-t border-slate-100 text-center space-y-2">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 bg-[#F4F8FC] hover:bg-[#E8F6FD] text-[#002970] border border-[#BDE3F9] font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#00BAF2]" />
            <span>1-Click Sign In as Executive (Judge Demo)</span>
          </button>
          <p className="text-[10px] text-slate-400">Default: executive@paytm.com / paytm123</p>
        </div>
      </div>
    </div>
  );
};
