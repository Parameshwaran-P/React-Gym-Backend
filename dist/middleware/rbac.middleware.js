"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const AppError_1 = require("../common/errors/AppError");
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            throw new AppError_1.ForbiddenError('Insufficient permissions');
        }
        next();
    };
}
