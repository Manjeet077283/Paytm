import React, { useState } from 'react';
import { SocketProvider } from './context/SocketContext';
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

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<any>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default true for frictionless hackathon demo

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1-Click Launch Demo Workflow: "Analyze September sales, identify the biggest business issues and prepare a management report."
  const handleLaunchDemo = async () => {
    try {
      const res = await api.createTask({
        goal: 'Analyze September sales, identify the biggest business issues and prepare a management report.',
        autonomyMode: 'Copilot',
        isDemo: true,
        datasetFilename: 'sales.csv'
      });

      if (res.success) {
        // Kick off execution and take user straight into the live 3-column workspace
        await api.runTask(res.task.id);
        handleNavigate('execution', { taskId: res.task.id });
      }
    } catch (err) {
      console.error('Failed to launch demo:', err);
      handleNavigate('new-task');
    }
  };

  if (!isAuthenticated && currentPage === 'login') {
    return <LoginPage onLoginSuccess={() => { setIsAuthenticated(true); setCurrentPage('dashboard'); }} />;
  }

  return (
    <SocketProvider>
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLaunchDemo={handleLaunchDemo}
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
            <LoginPage onLoginSuccess={() => handleNavigate('dashboard')} />
          )}
        </main>

        <Footer />
      </div>
    </SocketProvider>
  );
};
