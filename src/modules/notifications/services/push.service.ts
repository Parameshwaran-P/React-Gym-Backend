// import { getFirebaseMessaging } from '@/config/firebase.config';
// import { PushData } from '../types/notification.types';
// import logger from '@/config/logger';

// export class PushService {
//   async sendPushNotification(data: PushData): Promise<void> {
//     try {
//       if (!data.tokens || data.tokens.length === 0) {
//         logger.warn('No device tokens provided for push notification');
//         return;
//       }

//       const messaging = getFirebaseMessaging();

//       const message = {
//         notification: {
//           title: data.title,
//           body: data.body,
//         },
//         data: data.data,
//         tokens: data.tokens,
//       };

//       const response = await messaging.sendEachForMulticast(message);

//       logger.info('Push notifications sent', {
//         successCount: response.successCount,
//         failureCount: response.failureCount,
//       });

//       // Handle failed tokens
//       if (response.failureCount > 0) {
//         const failedTokens: string[] = [];
//         response.responses.forEach((resp, idx) => {
//           if (!resp.success) {
//             failedTokens.push(data.tokens[idx]);
//           }
//         });
//         logger.warn('Some push notifications failed', { failedTokens });
//       }
//     } catch (error: any) {
//       logger.error('Push notification failed', { error: error.message });
//       throw new Error(`Push notification failed: ${error.message}`);
//     }
//   }
// }