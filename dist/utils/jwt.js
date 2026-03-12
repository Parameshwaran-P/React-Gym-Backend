"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAuthToken = generateAuthToken;
exports.generatePasswordResetToken = generatePasswordResetToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}
// 🔐 Login Token
function generateAuthToken(userId, email, role) {
    return jsonwebtoken_1.default.sign({ userId, email, role, type: 'auth' }, JWT_SECRET, { expiresIn: '7d' });
}
// 🔐 Password Reset Token (Short lived)
function generatePasswordResetToken(userId) {
    return jsonwebtoken_1.default.sign({ userId, type: 'password_reset' }, JWT_SECRET, { expiresIn: '10m' });
}
// 🔎 Verify Token
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
}
