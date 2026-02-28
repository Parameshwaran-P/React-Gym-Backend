import { env } from './env';

export const notificationConfig = {
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE === 'true',
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    },
    from: {
      email: env.EMAIL_FROM,
      name: env.EMAIL_FROM_NAME,
    },
  },
  
  whatsapp: {
    apiUrl: env.WHATSAPP_API_URL,
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: env.WHATSAPP_ACCESS_TOKEN,
    businessAccountId: env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  },
  
  firebase: {
    projectId: env.FIREBASE_PROJECT_ID,
    privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
  },
  
  queue: {
    useQueue: env.USE_QUEUE === 'true',
    redisUrl: env.REDIS_URL,
  },
  
  retry: {
    maxAttempts: parseInt(env.MAX_RETRY_ATTEMPTS || '3'),
    delayMs: parseInt(env.RETRY_DELAY_MS || '5000'),
  },
  
  rateLimit: {
    perMinute: parseInt(env.NOTIFICATION_RATE_LIMIT_PER_MINUTE || '10'),
  },
};