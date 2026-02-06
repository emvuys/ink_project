import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  MAX_FILE_SIZE: z.string().default('1048576'),
  UPLOAD_DIR: z.string().default('uploads'),
  GCS_BUCKET_NAME: z.string().optional(),
  GCS_PROJECT_ID: z.string().optional(),
  GCS_KEYFILE_PATH: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment variable validation failed:');
  console.error(parsed.error.format());
  process.exit(1);
}

export const env = {
  database: {
    url: parsed.data.DATABASE_URL,
  },
  jwt: {
    secret: parsed.data.JWT_SECRET,
    expiresIn: parsed.data.JWT_EXPIRES_IN,
  },
  server: {
    port: parseInt(parsed.data.PORT, 10),
    nodeEnv: parsed.data.NODE_ENV,
    allowedOrigins: parsed.data.ALLOWED_ORIGINS.split(','),
  },
  upload: {
    maxFileSize: parseInt(parsed.data.MAX_FILE_SIZE, 10),
    uploadDir: parsed.data.UPLOAD_DIR,
  },
  gcs: {
    bucketName: parsed.data.GCS_BUCKET_NAME,
    projectId: parsed.data.GCS_PROJECT_ID,
    keyfilePath: parsed.data.GCS_KEYFILE_PATH,
  },
};
