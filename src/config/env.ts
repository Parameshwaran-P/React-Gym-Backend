import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
 CORS_ORIGINS: z.string().transform(val =>
  val.split(',').map(origin => origin.trim())
),
  // CORS_METHODS: z.string().transform(val => val.split(',')),
});

export const env = envSchema.parse(process.env);