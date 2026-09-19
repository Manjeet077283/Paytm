import React, { useState } from 'react';
import { Bot, Play, CheckCircle2, ShieldAlert, BarChart3, History, Settings, Sparkles, Database, Menu, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  pendingApprovalsCount?: number;
  onLaunchDemo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  pendingApprovalsCount = 0,
  onLaunchDemo
}) => {
  const { isConnected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'new-task', label: 'New Goal', icon: Play },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
    },
    { id: 'impact', label: 'Impact & ROI', icon: Sparkles },
    { id: 'audit', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#002970] text-white shadow-md border-b border-[#001D4D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Paytm WorkMate Brand Logo */}
          <div
            onClick={() => handleNavClick('landing')}
            className="flex items-center space-x-2.5 cursor-pointer select-none flex-shrink-0"
          >
            {/* Paytm Logo Mark */}
            <div className="w-9 h-9 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
                <rect width="100" height="100" rx="16" fill="#002970" />
                <path d="M22 30H46C56 30 64 38 64 48C64 58 56 66 46 66H34V80H22V30Z" fill="#00BAF2" />
                <circle cx="76" cy="48" r="10" fill="#00BAF2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-base tracking-tight text-white">paytm</span>
                <span className="font-extrabold text-base tracking-tight text-[#00BAF2]">workmate</span>
              </div>
              <p className="text-[10px] text-blue-200/90 font-medium leading-none">Autonomous AI Teammates</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#00BAF2] text-[#002970] shadow-sm font-bold'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black bg-amber-400 text-slate-900 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action & Status Area */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Socket.IO Status Badge */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-[#001D4D] px-2.5 py-1 rounded-full border border-blue-900/60 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-rose-400 animate-ping'}`} />
              <span className="text-blue-200 font-medium">{isConnected ? 'Live' : 'Connecting'}</span>
            </div>

            {/* Quick Demo Launch Button */}
            {onLaunchDemo && (
              <button
                onClick={onLaunchDemo}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#00BAF2] hover:bg-[#00a8dc] active:scale-95 text-[#002970] font-black text-xs rounded-lg shadow-sm transition-all"
                title="1-Click Run: September Business Review"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Run Demo</span>
              </button>
            )}

            {/* User Profile Avatar */}
            <div
              onClick={() => handleNavClick('settings')}
              className="flex items-center space-x-2 pl-1 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#00BAF2]/20 border border-[#00BAF2] flex items-center justify-center text-xs font-extrabold text-[#00BAF2]">
                VJ
              </div>
            </div>

            {/* Mobile Menu Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#001D4D] border-t border-blue-900/60 px-4 pt-3 pb-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#00BAF2] text-[#002970] font-bold'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-black bg-amber-400 text-slate-900 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
