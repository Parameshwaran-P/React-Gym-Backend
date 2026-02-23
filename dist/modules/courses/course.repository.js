"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRepository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const client_1 = require("@prisma/client");
class CourseRepository {
    async create(data) {
        return prisma_1.default.course.create({
            data,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        displayName: true,
                    },
                },
            },
        });
    }
    async findMany(params) {
        return prisma_1.default.course.findMany({
            ...params,
            where: {
                ...params.where,
                deletedAt: null,
            },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        displayName: true,
                    },
                },
            },
        });
    }
    async count(where) {
        return prisma_1.default.course.count({
            where: {
                ...where,
                deletedAt: null,
            },
        });
    }
    async findBySlug(slug) {
        return prisma_1.default.course.findUnique({
            where: { slug, deletedAt: null },
            include: {
                tags: {
                    include: {
                        tag: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        displayName: true,
                    },
                },
            },
        });
    }
    async findById(id) {
        return prisma_1.default.course.findUnique({
            where: { id, deletedAt: null },
        });
    }
    async update(id, data) {
        return prisma_1.default.course.update({
            where: { id },
            data,
        });
    }
    async publish(id) {
        return prisma_1.default.course.update({
            where: { id },
            data: {
                status: client_1.CourseStatus.PUBLISHED,
                publishedAt: new Date(),
            },
        });
    }
}
exports.CourseRepository = CourseRepository;
