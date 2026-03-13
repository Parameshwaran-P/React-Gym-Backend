"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    // ====================================
    // GENERAL CONFIG
    // ====================================
    // NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    //  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default(3000),
    DATABASE_URL: zod_1.z.string(),
    // ====================================
    // JWT CONFIG
    // ====================================
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    // ====================================
    // CORS CONFIG
    // ====================================
    CORS_ORIGINS: zod_1.z.string().transform(val => val.split(',').map(origin => origin.trim())),
    // ====================================
    // EMAIL / SMTP CONFIG
    // ====================================
    SMTP_HOST: zod_1.z.string().default('smtp.gmail.com'),
    SMTP_PORT: zod_1.z.string().default('587'),
    SMTP_SECURE: zod_1.z.string().default('false'),
    SMTP_USER: zod_1.z.string().email('SMTP_USER must be a valid email'),
    SMTP_PASSWORD: zod_1.z.string().min(1, 'SMTP_PASSWORD is required'),
    EMAIL_FROM: zod_1.z.string().email('EMAIL_FROM must be a valid email'),
    EMAIL_FROM_NAME: zod_1.z.string().default('Notification System'),
    RESEND_API_KEY: zod_1.z.string().optional(),
    // ====================================
    // WHATSAPP CONFIG
    // ====================================
    WHATSAPP_API_URL: zod_1.z.string().default('https://graph.facebook.com/v17.0'),
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
    REDIS_URL: zod_1.z.string().optional(),
    USE_QUEUE: zod_1.z.string().default('false'),
    // ====================================
    // RETRY CONFIG
    // ====================================
    MAX_RETRY_ATTEMPTS: zod_1.z.string().default('3'),
    RETRY_DELAY_MS: zod_1.z.string().default('5000'),
    // ====================================
    // RATE LIMITING
    // ====================================
    NOTIFICATION_RATE_LIMIT_PER_MINUTE: zod_1.z.string().default('10'),
});
exports.env = envSchema.parse(process.env);
