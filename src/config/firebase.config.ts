import admin from 'firebase-admin';
import { notificationConfig } from './notification.config';

let firebaseApp: admin.app.App | null = null;

export function initializeFirebase() {
  if (!firebaseApp) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: notificationConfig.firebase.projectId,
        privateKey: notificationConfig.firebase.privateKey,
        clientEmail: notificationConfig.firebase.clientEmail,
      }),
    });
  }
  return firebaseApp;
}

export function getFirebaseMessaging() {
  const app = initializeFirebase();
  return admin.messaging(app);
}