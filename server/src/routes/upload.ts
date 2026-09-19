import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import csv from 'csv-parser';
import { CONFIG } from '../config';

export const uploadRouter = Router();

// Configure storage for uploaded CSVs
const uploadsDir = path.join(CONFIG.DATA_DIR, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `custom_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: CONFIG.MAX_UPLOAD_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV format is supported.'));
    }
  }
});

// POST /api/upload - Upload and validate custom sales CSV
uploadRouter.post('/', upload.single('dataset'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No CSV file uploaded' });
    }

    const uploadedPath = req.file.path;
    const requiredColumns = ['revenue', 'category'];
    const rows: any[] = [];
    let detectedHeaders: string[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(uploadedPath)
        .pipe(csv())
        .on('headers', (headers: string[]) => {
          detectedHeaders = headers;
        })
        .on('data', (data) => rows.push(data))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    if (rows.length === 0) {
      fs.unlinkSync(uploadedPath);
      return res.status(400).json({ success: false, error: 'Uploaded CSV file contains no data rows.' });
    }

    // Check for critical required fields
    const missing = requiredColumns.filter((col) => !detectedHeaders.some((h) => h.toLowerCase().includes(col)));
    if (missing.length > 0) {
      return res.json({
        success: true,
        filename: path.basename(uploadedPath),
        rowCount: rows.length,
        warning: `Uploaded file is missing recommended columns: [${missing.join(', ')}]. Fallback column mapping will be applied.`,
        headers: detectedHeaders
      });
    }

    return res.json({
      success: true,
      filename: `uploads/${path.basename(uploadedPath)}`,
      rowCount: rows.length,
      headers: detectedHeaders,
      message: `Successfully validated ${rows.length} rows.`
    });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});
