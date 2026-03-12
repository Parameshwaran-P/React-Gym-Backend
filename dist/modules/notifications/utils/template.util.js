"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationTemplate = getNotificationTemplate;
const client_1 = require("@prisma/client");
function getNotificationTemplate(type, metadata) {
    switch (type) {
        case client_1.NotificationType.REGISTRATION_SUCCESS:
            return getRegistrationSuccessTemplate(metadata);
        case client_1.NotificationType.LOGIN_SUCCESS:
            return getLoginAlertTemplate(metadata);
        case client_1.NotificationType.FORGOT_PASSWORD:
            return getForgotPasswordTemplate(metadata);
        case client_1.NotificationType.COURSE_PURCHASED:
            return getCoursePurchasedTemplate(metadata);
        case client_1.NotificationType.PAYMENT_SUCCESS:
            return getPaymentSuccessTemplate(metadata);
        case client_1.NotificationType.PAYMENT_FAILED:
            return getPaymentFailedTemplate(metadata);
        case client_1.NotificationType.SYSTEM_ALERT:
            return getSystemAlertTemplate(metadata);
        default:
            return getDefaultTemplate(metadata);
    }
}
function getCoursePurchasedTemplate(metadata) {
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
function getPaymentSuccessTemplate(metadata) {
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
function getPaymentFailedTemplate(metadata) {
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
function getRegistrationSuccessTemplate(metadata) {
    return {
        subject: 'Welcome to Gamified Learning 🎉',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">Welcome ${metadata?.name || 'User'}!</h2>
        <p>Your account has been successfully created.</p>
        <p>We're excited to have you join our learning community.</p>

        <a href="${metadata?.loginUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">
          Start Learning
        </a>

        <p style="margin-top:20px;">Happy Learning 🚀</p>
        <p><strong>ReactGym Team</strong></p>
      </div>
    `,
        text: `Welcome ${metadata?.name || 'User'}! Your account has been created successfully. Login here: ${metadata?.loginUrl}`
    };
}
function getLoginAlertTemplate(metadata) {
    return {
        subject: 'New Login Detected',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">New Login Detected</h2>
        <p>Hello ${metadata?.name || 'User'},</p>
        <p>Your account was just logged in.</p>

        <p><strong>Device:</strong> ${metadata?.device || 'Unknown device'}</p>
        <p><strong>Location:</strong> ${metadata?.location || 'Unknown location'}</p>
        <p><strong>Time:</strong> ${metadata?.time || new Date().toLocaleString()}</p>

        <p>If this wasn't you, please reset your password immediately.</p>

        <a href="${metadata?.securityUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">
          Secure Account
        </a>
      </div>
    `,
        text: `New login detected from ${metadata?.device} at ${metadata?.time}. If this wasn't you, secure your account here: ${metadata?.securityUrl}`
    };
}
function getForgotPasswordTemplate(metadata) {
    return {
        subject: 'Reset Your Password 🔐',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Password Reset Request</h2>

        <p>Hello ${metadata?.name || 'User'},</p>

        <p>We received a request to reset your password for your account.</p>

        <p>If you made this request, click the button below to reset your password.</p>

        <a href="${metadata?.resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #f59e0b; color: white; text-decoration: none; border-radius: 4px; margin-top: 16px;">
          Reset Password
        </a>

        <p style="margin-top:20px;">
          This link will expire in <strong>15 minutes</strong>.
        </p>

        <p>If you did not request a password reset, please ignore this email. Your account remains secure.</p>

        <p style="margin-top:20px;">Stay secure 🔒</p>
        <p><strong>ReactGym Team</strong></p>
      </div>
    `,
        text: `
Hello ${metadata?.name || 'User'},

We received a request to reset your password.

Reset your password here:
${metadata?.resetUrl}

This link will expire in 15 minutes.

If you didn't request this, you can safely ignore this email.

ReactGym Team
`
    };
}
function getSystemAlertTemplate(metadata) {
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
function getDefaultTemplate(metadata) {
    return {
        subject: metadata?.subject || 'Notification',
        html: `<p>${metadata?.message || ''}</p>`,
        text: metadata?.message || '',
    };
}
