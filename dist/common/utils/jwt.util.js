"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../config/env");
function generateToken(userId, email, role) {
    return jsonwebtoken_1.default.sign({ userId, email, role }, env_1.env.JWT_SECRET, { expiresIn: parseInt(env_1.env.JWT_EXPIRES_IN) });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
}
