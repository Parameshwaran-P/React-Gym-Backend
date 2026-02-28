import axios from 'axios';
import { notificationConfig } from '@/config/notification.config';
import { WhatsAppData } from '../types/notification.types';
import logger from '@/config/logger';

export class WhatsAppService {
  private apiUrl: string;
  private phoneNumberId: string;
  private accessToken: string;

  constructor() {
    this.apiUrl = notificationConfig.whatsapp.apiUrl;
    this.phoneNumberId = notificationConfig.whatsapp.phoneNumberId;
    this.accessToken = notificationConfig.whatsapp.accessToken;
  }

  async sendMessage(data: WhatsAppData): Promise<void> {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;

      const payload: any = {
        messaging_product: 'whatsapp',
        to: data.to,
      };

      if (data.templateName) {
        // Use approved template
        payload.type = 'template';
        payload.template = {
          name: data.templateName,
          language: { code: 'en' },
          components: data.templateParams
            ? [
                {
                  type: 'body',
                  parameters: data.templateParams.map((param) => ({
                    type: 'text',
                    text: param,
                  })),
                },
              ]
            : [],
        };
      } else {
        // Simple text message (only works in sandbox/test mode)
        payload.type = 'text';
        payload.text = { body: data.message };
      }

      await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      logger.info('WhatsApp message sent successfully', { to: data.to });
    } catch (error: any) {
      logger.error('WhatsApp message failed', {
        error: error.response?.data || error.message,
        to: data.to,
      });
      throw new Error(`WhatsApp sending failed: ${error.message}`);
    }
  }
}