import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env or root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import fs from 'fs';

function resolveDataDir(): string {
  const candidates = [
    process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : null,
    path.resolve(process.cwd(), 'data'),
    path.resolve(process.cwd(), '../data'),
    path.resolve(__dirname, '../../data'),
    path.resolve(__dirname, '../data'),
    path.resolve(__dirname, './data')
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, 'sales', 'sales.csv'))) {
      return candidate;
    }
  }
  return candidates[0] || path.resolve(__dirname, '../../data');
}

function resolveReportsDir(): string {
  const dir = process.env.REPORTS_DIR 
    ? path.resolve(process.env.REPORTS_DIR)
    : path.resolve(process.cwd(), 'generated_reports');
  if (!fs.existsSync(dir)) {
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_) {}
  }
  return dir;
}

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '5001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/paytm_workmate',
  JWT_SECRET: process.env.JWT_SECRET || 'paytm_workmate_super_secret_jwt_key_2025_secure',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '',
  LLM_API_KEY: process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || '',
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-2.5-flash',
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  DATA_DIR: resolveDataDir(),
  REPORTS_DIR: resolveReportsDir(),
  MAX_UPLOAD_SIZE_BYTES: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || '10485760', 10)
};

