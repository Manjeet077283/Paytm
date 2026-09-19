import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { NewTaskPage } from './pages/NewTaskPage';
import { TaskExecutionPage } from './pages/TaskExecutionPage';
import { FinalResultPage } from './pages/FinalResultPage';
import { ApprovalCenter } from './pages/ApprovalCenter';
import { ImpactDashboard } from './pages/ImpactDashboard';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { api } from './api/client';

const PROTECTED_PAGES = [
  'dashboard',
  'new-task',
  'execution',
  'final-result',
  'approvals',
  'impact',
  'audit',
  'settings'
];

const AppContent: React.FC = () => {
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<any>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('paytm_token');
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('paytm_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Verify session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('paytm_token');
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setCurrentUser(res.user);
            setIsAuthenticated(true);
          } else {
            // Token expired
            api.logout();
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } catch {
          // If offline, keep local user state
        }
      }
    };
    checkAuth();
  }, []);

  const handleNavigate = (page: string, params: any = {}) => {
    if (!isAuthenticated && PROTECTED_PAGES.includes(page)) {
      toast.error('Please sign in or register to access this workspace section.');
      setCurrentPage('login');
      setPageParams({ returnTo: page, ...params });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    const destination = pageParams?.returnTo || 'dashboard';
    setCurrentPage(destination);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage('login');
    toast.info('Signed out of Paytm WorkMate.');
  };

  // 1-Click Launch Demo Workflow
  const handleLaunchDemo = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in before executing autonomous AI workflows.');
      handleNavigate('login', { returnTo: 'new-task' });
      return;
    }

    try {
      const res = await api.createTask({
        goal: 'Analyze September sales, identify the biggest business issues and prepare a management report.',
        autonomyMode: 'Copilot',
        isDemo: true,
        datasetFilename: 'sales.csv'
      });

      if (res.success) {
        toast.success('September Sales Analysis Goal initialized successfully!');
        await api.runTask(res.task.id);
        handleNavigate('execution', { taskId: res.task.id });
      } else {
        toast.error('Failed to create demo goal. Check backend service.');
      }
    } catch (err) {
      console.error('Failed to launch demo:', err);
      toast.error('Network error while launching demo workflow.');
      handleNavigate('new-task');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLaunchDemo={handleLaunchDemo}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-grow">
        {currentPage === 'landing' && (
          <LandingPage onNavigate={handleNavigate} onLaunchDemo={handleLaunchDemo} />
        )}

        {currentPage === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} onLaunchDemo={handleLaunchDemo} />
        )}

        {currentPage === 'new-task' && (
          <NewTaskPage onNavigate={handleNavigate} defaultGoal={pageParams.goal} />
        )}

        {currentPage === 'execution' && (
          <TaskExecutionPage
            taskId={pageParams.taskId || 'TASK_PREVIEW_001'}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'final-result' && (
          <FinalResultPage
            taskId={pageParams.taskId || 'TASK_PREVIEW_001'}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'approvals' && (
          <ApprovalCenter onNavigate={handleNavigate} />
        )}

        {currentPage === 'impact' && (
          <ImpactDashboard />
        )}

        {currentPage === 'audit' && (
          <AuditLogsPage />
        )}

        {currentPage === 'settings' && (
          <SettingsPage />
        )}

        {currentPage === 'login' && (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </ToastProvider>
  );
};
