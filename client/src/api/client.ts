import { TaskRecord, ApprovalRequest, ExecutionLog, ReportMetadata } from '../types';

const RAW_URL = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE = RAW_URL ? `${RAW_URL.replace(/\/$/, '')}/api` : '/api';

export const api = {
  // Tasks
  async createTask(params: { goal: string; autonomyMode?: string; isDemo?: boolean; datasetFilename?: string }): Promise<{ success: boolean; task: TaskRecord }> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  async getTasks(): Promise<{ success: boolean; tasks: TaskRecord[] }> {
    const res = await fetch(`${API_BASE}/tasks`);
    return res.json();
  },

  async getTask(id: string): Promise<{ success: boolean; task: TaskRecord }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    return res.json();
  },

  async runTask(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/tasks/${id}/run`, { method: 'POST' });
    return res.json();
  },

  async cancelTask(id: string): Promise<{ success: boolean; task: TaskRecord }> {
    const res = await fetch(`${API_BASE}/tasks/${id}/cancel`, { method: 'POST' });
    return res.json();
  },

  // Approvals
  async getApprovals(): Promise<{ success: boolean; approvals: ApprovalRequest[] }> {
    const res = await fetch(`${API_BASE}/approvals`);
    return res.json();
  },

  async approveAction(id: string, comments?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/approvals/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments })
    });
    return res.json();
  },

  async rejectAction(id: string, comments?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/approvals/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments })
    });
    return res.json();
  },

  // Reports
  async getReport(taskId: string): Promise<{ success: boolean; report: ReportMetadata }> {
    const res = await fetch(`${API_BASE}/reports/${taskId}`);
    return res.json();
  },

  getPdfUrl(taskId: string): string {
    return `${API_BASE}/reports/${taskId}/pdf`;
  },

  getExcelUrl(taskId: string): string {
    return `${API_BASE}/reports/${taskId}/excel`;
  },

  // Audit Logs
  async getAuditLogs(): Promise<{ success: boolean; logs: ExecutionLog[]; total: number }> {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return res.json();
  },

  async getTaskLogs(taskId: string): Promise<{ success: boolean; logs: ExecutionLog[] }> {
    const res = await fetch(`${API_BASE}/audit-logs/task/${taskId}`);
    return res.json();
  },

  // Impact
  async getImpact(): Promise<{ success: boolean; metrics: any }> {
    const res = await fetch(`${API_BASE}/impact`);
    return res.json();
  },

  // Tools
  async getTools(): Promise<{ success: boolean; tools: any[] }> {
    const res = await fetch(`${API_BASE}/tools`);
    return res.json();
  },

  // Upload CSV
  async uploadCsv(file: File): Promise<{ success: boolean; filename: string; rowCount: number; message: string }> {
    const formData = new FormData();
    formData.append('dataset', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  }
};
