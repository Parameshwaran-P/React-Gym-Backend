"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetToken = generateResetToken;
exports.hashResetToken = hashResetToken;
const crypto_1 = __importDefault(require("crypto"));
// Generate raw token (sent to user)
function generateResetToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
// Hash token before saving in DB
function hashResetToken(token) {
    return crypto_1.default
        .createHash('sha256')
        .update(token)
        .digest('hex');
}
