"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationConfig = void 0;
const env_1 = require("./env");
exports.notificationConfig = {
    email: {
        smtp: {
            host: env_1.env.SMTP_HOST,
            port: env_1.env.SMTP_PORT,
            secure: env_1.env.SMTP_SECURE === 'true',
            auth: {
                user: env_1.env.SMTP_USER,
                pass: env_1.env.SMTP_PASSWORD,
            },
        },
        from: {
            email: env_1.env.EMAIL_FROM,
            name: env_1.env.EMAIL_FROM_NAME,
        },
    },
    // whatsapp: {
    //   apiUrl: env.WHATSAPP_API_URL,
    //   phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    //   accessToken: env.WHATSAPP_ACCESS_TOKEN,
    //   businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    // },
    // firebase: {
    //   projectId: env.FIREBASE_PROJECT_ID,
    //   privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    //   clientEmail: env.FIREBASE_CLIENT_EMAIL,
    // },
    queue: {
        useQueue: env_1.env.USE_QUEUE === 'false',
        redisUrl: env_1.env.REDIS_URL,
    },
    retry: {
        maxAttempts: parseInt(env_1.env.MAX_RETRY_ATTEMPTS || '3'),
        delayMs: parseInt(env_1.env.RETRY_DELAY_MS || '5000'),
    },
    rateLimit: {
        perMinute: parseInt(env_1.env.NOTIFICATION_RATE_LIMIT_PER_MINUTE || '10'),
    },
};
