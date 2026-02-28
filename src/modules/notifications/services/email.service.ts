import nodemailer from 'nodemailer';
import { notificationConfig } from '@/config/notification.config';
import { EmailData } from '../types/notification.types';
import logger from '@/config/logger';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport(notificationConfig.email.smtp);
  }

  async sendEmail(data: EmailData): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${notificationConfig.email.from.name}" <${notificationConfig.email.from.email}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      });

      logger.info('Email sent successfully', { to: data.to, subject: data.subject });
    } catch (error: any) {
      logger.error('Email sending failed', { error: error.message, to: data.to });
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('SMTP connection verified');
      return true;
    } catch (error: any) {
      logger.error('SMTP connection failed', { error: error.message });
      return false;
    }
  }
}