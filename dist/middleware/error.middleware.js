"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const errors_1 = require("@/common/errors");
const response_util_1 = require("@/common/utils/response.util");
const logger_1 = __importDefault(require("@/config/logger"));
function errorMiddleware(err, req, res, next) {
    if (err instanceof errors_1.AppError) {
        logger_1.default.warn('Application error', {
            code: err.code,
            message: err.message,
            path: req.path,
            method: req.method,
        });
        return res.status(err.statusCode).json((0, response_util_1.errorResponse)(err.code, err.message, err.details));
    }
    // Unexpected errors
    logger_1.default.error('Unexpected error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    res.status(500).json((0, response_util_1.errorResponse)('INTERNAL_SERVER_ERROR', 'An unexpected error occurred'));
}
