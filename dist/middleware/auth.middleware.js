"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_util_1 = require("@/common/utils/jwt.util");
const errors_1 = require("@/common/errors");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.substring(7);
        const payload = (0, jwt_util_1.verifyToken)(token);
        req.user = {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            next(new errors_1.UnauthorizedError('Token expired', 'TOKEN_EXPIRED'));
        }
        else if (error.name === 'JsonWebTokenError') {
            next(new errors_1.UnauthorizedError('Invalid token', 'INVALID_TOKEN'));
        }
        else {
            next(error);
        }
    }
}
