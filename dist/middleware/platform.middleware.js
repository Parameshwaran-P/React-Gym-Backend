"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformMiddleware = platformMiddleware;
function platformMiddleware(req, res, next) {
    const platform = req.headers['x-platform'] || 'web';
    req.platform = platform;
    next();
}
