"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const errors_1 = require("@/common/errors");
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !allowedRoles.includes(userRole)) {
            throw new errors_1.ForbiddenError('Insufficient permissions');
        }
        next();
    };
}
