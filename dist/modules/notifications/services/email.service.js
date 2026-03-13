"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const notification_config_1 = require("../../../config/notification.config");
const logger_1 = __importDefault(require("../../../config/logger"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            ...notification_config_1.notificationConfig.email.smtp,
            port: Number(notification_config_1.notificationConfig.email.smtp.port),
        });
    }
    async sendEmail(data) {
        try {
            await this.transporter.sendMail({
                from: `"${notification_config_1.notificationConfig.email.from.name}" <${notification_config_1.notificationConfig.email.from.email}>`,
                to: data.to,
                subject: data.subject,
                html: data.html,
                text: data.text,
            });
            logger_1.default.info('Email sent successfully', { to: data.to, subject: data.subject });
        }
        catch (error) {
            logger_1.default.error('Email sending failed', { error: error.message, to: data.to });
            throw new Error(`Email sending failed: ${error.message}`);
        }
    }
    async verifyConnection() {
        try {
            await this.transporter.verify();
            logger_1.default.info('SMTP connection verified');
            return true;
        }
        catch (error) {
            logger_1.default.error('SMTP connection failed', { error: error.message });
            return false;
        }
    }
}
exports.EmailService = EmailService;
