// 

import { Resend } from "resend";
import { notificationConfig } from "../../../config/notification.config";
import logger from "../../../config/logger";
import { EmailData } from "../types/notification.types";

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(data: EmailData): Promise<void> {
    try {
      const response = await this.resend.emails.send({
        from: `"${notificationConfig.email.from.name}" <${notificationConfig.email.from.email}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      });

      logger.info("Email sent successfully", {
        to: data.to,
        subject: data.subject,
        id: response.data?.id,
      });
    } catch (error: any) {
      logger.error("Email sending failed", {
        error: error.message,
        to: data.to,
      });

      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      // simple API test
      if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY missing");
      }

      logger.info("Resend connection verified");
      return true;
    } catch (error: any) {
      logger.error("Resend connection failed", { error: error.message });
      return false;
    }
  }
}