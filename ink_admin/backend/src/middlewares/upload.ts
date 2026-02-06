import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

// Ensure upload directory exists
if (!fs.existsSync(env.upload.uploadDir)) {
  fs.mkdirSync(env.upload.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.upload.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['video/mp4', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4 and GIF files are allowed'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: env.upload.maxFileSize,
  },
  fileFilter,
});
