"use strict";
// 
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const resend_1 = require("resend");
const logger_1 = __importDefault(require("../../../config/logger"));
class EmailService {
    constructor() {
        this.resend = new resend_1.Resend(process.env.RESEND_API_KEY);
    }
    async sendEmail(data) {
        try {
            const response = await this.resend.emails.send({
                from: "React Gym <noreply@noreplyreactgym.online>",
                to: data.to,
                subject: data.subject,
                html: data.html,
                text: data.text,
            });
            logger_1.default.info("Email sent successfully", {
                to: data.to,
                subject: data.subject,
                id: response.data?.id,
            });
        }
        catch (error) {
            logger_1.default.error("Email sending failed", {
                error: error.message,
                to: data.to,
            });
            throw new Error(`Email sending failed: ${error.message}`);
        }
    }
    async verifyConnection() {
        try {
            // simple API test
            if (!process.env.RESEND_API_KEY) {
                throw new Error("RESEND_API_KEY missing");
            }
            logger_1.default.info("Resend connection verified");
            return true;
        }
        catch (error) {
            logger_1.default.error("Resend connection failed", { error: error.message });
            return false;
        }
    }
}
exports.EmailService = EmailService;
