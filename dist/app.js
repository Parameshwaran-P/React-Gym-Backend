"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const platform_middleware_1 = require("./middleware/platform.middleware");
const index_1 = __importDefault(require("./routes/index"));
// import logger from '../config/logger';
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGINS,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(platform_middleware_1.platformMiddleware);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env_1.env.NODE_ENV,
    });
});
// API routes
app.use('/api/v1', index_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found',
        },
    });
});
// Error handler (must be last)
app.use(error_middleware_1.errorMiddleware);
exports.default = app;
