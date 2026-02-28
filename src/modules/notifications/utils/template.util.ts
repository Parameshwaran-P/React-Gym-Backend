import { NotificationType } from '@prisma/client';
import { NotificationTemplate } from '../types/notification.types';
import fs from 'fs';
import path from 'path';

export function getNotificationTemplate(
  type: NotificationType,
  metadata?: Record<string, any>
): NotificationTemplate {
  switch (type) {
    case 'COURSE_PURCHASED':
      return getCoursePurchasedTemplate(metadata);
    case 'PAYMENT_SUCCESS':
      return getPaymentSuccessTemplate(metadata);
    case 'PAYMENT_FAILED':
      return getPaymentFailedTemplate(metadata);
    case 'SYSTEM_ALERT':
      return getSystemAlertTemplate(metadata);
    default:
      return getDefaultTemplate(metadata);
  }
}

function getCoursePurchasedTemplate(metadata?: Record<string, any>): NotificationTemplate {
  const courseName = metadata?.courseName || 'Your Course';
  
  return {
    subject: `Welcome to ${courseName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Course Purchase Confirmed! 🎉</h2>
        <p>Hi ${metadata?.userName || 'there'},</p>
        <p>Thank you for purchasing <strong>${courseName}</strong>!</p>
        <p>You now have lifetime access to all course materials.</p>
        <a href="${metadata?.courseUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">
          Start Learning
        </a>
        <p style="margin-top: 24px; color: #666;">Happy learning!<br>The Team</p>
      </div>
    `,
    text: `Thank you for purchasing ${courseName}! Start learning at ${metadata?.courseUrl}`,
    whatsappMessage: `🎉 Welcome to ${courseName}! You now have lifetime access. Start learning: ${metadata?.courseUrl}`,
  };
}

function getPaymentSuccessTemplate(metadata?: Record<string, any>): NotificationTemplate {
  return {
    subject: 'Payment Successful',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Payment Received ✓</h2>
        <p>Your payment of <strong>$${metadata?.amount}</strong> has been processed successfully.</p>
        <p>Transaction ID: ${metadata?.transactionId}</p>
        <p style="color: #666;">Thank you for your purchase!</p>
      </div>
    `,
    text: `Payment of $${metadata?.amount} received. Transaction ID: ${metadata?.transactionId}`,
  };
}

function getPaymentFailedTemplate(metadata?: Record<string, any>): NotificationTemplate {
  return {
    subject: 'Payment Failed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f44336;">Payment Failed</h2>
        <p>We were unable to process your payment of <strong>$${metadata?.amount}</strong>.</p>
        <p>Reason: ${metadata?.reason || 'Payment declined'}</p>
        <a href="${metadata?.retryUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">
          Try Again
        </a>
      </div>
    `,
    text: `Payment failed for $${metadata?.amount}. Please try again at ${metadata?.retryUrl}`,
  };
}

function getSystemAlertTemplate(metadata?: Record<string, any>): NotificationTemplate {
  return {
    subject: metadata?.subject || 'System Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${metadata?.title || 'System Alert'}</h2>
        <p>${metadata?.message}</p>
      </div>
    `,
    text: metadata?.message || '',
  };
}

function getDefaultTemplate(metadata?: Record<string, any>): NotificationTemplate {
  return {
    subject: metadata?.subject || 'Notification',
    html: `<p>${metadata?.message || ''}</p>`,
    text: metadata?.message || '',
  };
}