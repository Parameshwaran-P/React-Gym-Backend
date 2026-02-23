"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = getPaginationParams;
exports.getPaginationMeta = getPaginationMeta;
exports.getSkipTake = getSkipTake;
function getPaginationParams(page, limit) {
    const parsedPage = Math.max(1, parseInt(String(page || 1)));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit || 20))));
    return {
        page: parsedPage,
        limit: parsedLimit,
    };
}
function getPaginationMeta(page, limit, total) {
    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
}
function getSkipTake(page, limit) {
    return {
        skip: (page - 1) * limit,
        take: limit,
    };
}
