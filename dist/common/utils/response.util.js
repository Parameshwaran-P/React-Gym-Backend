"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
function successResponse(data, meta) {
    return {
        success: true,
        data,
        meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
            ...meta,
        },
    };
}
function errorResponse(code, message, details) {
    return {
        success: false,
        error: {
            code,
            message,
            details,
        },
        meta: {
            timestamp: new Date().toISOString(),
            version: 'v1',
        },
    };
}
