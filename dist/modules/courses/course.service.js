"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const course_repository_1 = require("./course.repository");
const errors_1 = require("@/common/errors");
const client_1 = require("@prisma/client");
const pagination_util_1 = require("@/common/utils/pagination.util");
const stepFilter_util_1 = require("./utils/stepFilter.util");
const prisma_1 = __importDefault(require("@/config/prisma"));
class CourseService {
    constructor() {
        this.courseRepository = new course_repository_1.CourseRepository();
    }
    async createCourse(input, userId, userRole) {
        // Authorization check
        if (userRole !== client_1.Role.ADMIN && userRole !== client_1.Role.CONTENT_EDITOR) {
            throw new errors_1.ForbiddenError('Only admins and editors can create courses');
        }
        const course = await this.courseRepository.create({
            ...input,
            createdById: userId,
        });
        // Add tags if provided
        if (input.tags && input.tags.length > 0) {
            await this.addTagsToCourse(course.id, input.tags);
        }
        return course;
    }
    async getCourseList(params, userId, userRole) {
        const { page, limit } = (0, pagination_util_1.getPaginationParams)(params.page, params.limit);
        const { skip, take } = (0, pagination_util_1.getSkipTake)(page, limit);
        // Build where clause
        const where = {};
        // Non-admin users only see published courses
        if (userRole !== client_1.Role.ADMIN && userRole !== client_1.Role.CONTENT_EDITOR) {
            where.status = client_1.CourseStatus.PUBLISHED;
        }
        else if (params.status) {
            where.status = params.status;
        }
        if (params.difficulty) {
            where.difficulty = params.difficulty;
        }
        if (params.tag) {
            where.tags = {
                some: {
                    tag: {
                        slug: params.tag,
                    },
                },
            };
        }
        const [courses, total] = await Promise.all([
            this.courseRepository.findMany({
                skip,
                take,
                where,
                orderBy: { orderIndex: 'asc' },
            }),
            this.courseRepository.count(where),
        ]);
        // Attach user progress if authenticated
        let progressMap = {};
        if (userId) {
            const courseIds = courses.map(c => c.id);
            const progress = await prisma_1.default.courseProgress.findMany({
                where: {
                    userId,
                    courseId: { in: courseIds },
                },
            });
            progressMap = progress.reduce((acc, p) => {
                acc[p.courseId] = p;
                return acc;
            }, {});
        }
        const coursesWithProgress = courses.map(course => ({
            id: course.id,
            slug: course.slug,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            estimatedHours: course.estimatedHours,
            totalXp: course.totalXp,
            thumbnailUrl: course.thumbnailUrl,
            tags: course.tags.map((ct) => ct.tag.name),
            status: course.status,
            userProgress: progressMap[course.id] ? {
                status: progressMap[course.id].status,
                completionRate: progressMap[course.id].completionRate,
            } : null,
        }));
        return {
            courses: coursesWithProgress,
            pagination: (0, pagination_util_1.getPaginationMeta)(page, limit, total),
        };
    }
    async getCourseBySlug(slug, userId) {
        const course = await this.courseRepository.findBySlug(slug);
        if (!course) {
            throw new errors_1.NotFoundError('Course not found', 'COURSE_NOT_FOUND');
        }
        // Filter sensitive data from steps
        const filteredSteps = (0, stepFilter_util_1.filterCourseSteps)(course.stepsDefinition);
        // Get user progress if authenticated
        let userProgress = null;
        if (userId) {
            userProgress = await prisma_1.default.courseProgress.findUnique({
                where: {
                    userId_courseId: {
                        userId,
                        courseId: course.id,
                    },
                },
            });
            // Merge progress into steps
            if (userProgress) {
                const stepsProgressData = userProgress.stepsProgress;
                for (const [key, step] of Object.entries(filteredSteps)) {
                    step.userProgress = stepsProgressData[key] || { status: 'NOT_STARTED' };
                }
            }
        }
        return {
            id: course.id,
            slug: course.slug,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            estimatedHours: course.estimatedHours,
            totalXp: course.totalXp,
            previewVideoUrl: course.previewVideoUrl,
            thumbnailUrl: course.thumbnailUrl,
            steps: filteredSteps,
            tags: course.tags.map((ct) => ct.tag.name),
            createdBy: course.createdBy,
            publishedAt: course.publishedAt,
            userProgress: userProgress ? {
                status: userProgress.status,
                completionRate: userProgress.completionRate,
                completedSteps: userProgress.completedSteps,
                totalSteps: userProgress.totalSteps,
                xpEarned: userProgress.xpEarned,
                startedAt: userProgress.startedAt,
            } : null,
        };
    }
    async publishCourse(courseId, userId, userRole) {
        if (userRole !== client_1.Role.ADMIN && userRole !== client_1.Role.CONTENT_EDITOR) {
            throw new errors_1.ForbiddenError('Only admins and editors can publish courses');
        }
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
            throw new errors_1.NotFoundError('Course not found', 'COURSE_NOT_FOUND');
        }
        // Editors can only publish their own courses
        if (userRole === client_1.Role.CONTENT_EDITOR && course.createdById !== userId) {
            throw new errors_1.ForbiddenError('You can only publish your own courses');
        }
        return this.courseRepository.publish(courseId);
    }
    async addTagsToCourse(courseId, tagNames) {
        for (const tagName of tagNames) {
            const slug = tagName.toLowerCase().replace(/\s+/g, '-');
            // Get or create tag
            const tag = await prisma_1.default.tag.upsert({
                where: { slug },
                create: { name: tagName, slug },
                update: {},
            });
            // Link to course
            await prisma_1.default.courseTag.create({
                data: {
                    courseId,
                    tagId: tag.id,
                },
            });
        }
    }
}
exports.CourseService = CourseService;
