import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // ====================================
  // GENERAL CONFIG
  // ====================================
    // NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  //  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string(),
  
  // ====================================
  // JWT CONFIG
  // ====================================
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // ====================================
  // CORS CONFIG
  // ====================================
  CORS_ORIGINS: z.string().transform(val =>
    val.split(',').map(origin => origin.trim())
  ),
  
  // ====================================
  // EMAIL / SMTP CONFIG
  // ====================================
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().default('587'),
  SMTP_SECURE: z.string().default('false'),
  SMTP_USER: z.string().email('SMTP_USER must be a valid email'),
  SMTP_PASSWORD: z.string().min(1, 'SMTP_PASSWORD is required'),
  EMAIL_FROM: z.string().default('noreplyreactgym.online'),
  EMAIL_FROM_NAME: z.string().default('Notification System'),
  RESEND_API_KEY: z.string().optional(),
  // ====================================
  // WHATSAPP CONFIG
  // ====================================
  WHATSAPP_API_URL: z.string().default('https://graph.facebook.com/v17.0'),
  // WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  // WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  // WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().optional(),
  
  // ====================================
  // FIREBASE CONFIG (Push Notifications)
  // ====================================
  // FIREBASE_PROJECT_ID: z.string().optional(),
  // FIREBASE_PRIVATE_KEY: z.string().optional(),
  // FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  
  // ====================================
  // QUEUE CONFIG
  // ====================================
  REDIS_URL: z.string().optional(),
  USE_QUEUE: z.string().default('false'),
  
  // ====================================
  // RETRY CONFIG
  // ====================================
  MAX_RETRY_ATTEMPTS: z.string().default('3'),
  RETRY_DELAY_MS: z.string().default('5000'),
  
  // ====================================
  // RATE LIMITING
  // ====================================
  NOTIFICATION_RATE_LIMIT_PER_MINUTE: z.string().default('10'),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);