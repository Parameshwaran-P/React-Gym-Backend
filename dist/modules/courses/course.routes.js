"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const course_controller_1 = require("./course.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const course_validation_1 = require("./course.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const courseController = new course_controller_1.CourseController();
// Public routes
router.get('/', (0, validation_middleware_1.validate)(course_validation_1.getCourseListSchema), courseController.getCourseList);
router.get('/:slug', courseController.getCourseBySlug);
// Protected routes
router.post('/', auth_middleware_1.authMiddleware, (0, rbac_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.CONTENT_EDITOR), (0, validation_middleware_1.validate)(course_validation_1.createCourseSchema), courseController.createCourse);
router.patch('/:courseId/publish', auth_middleware_1.authMiddleware, (0, rbac_middleware_1.requireRole)(client_1.Role.ADMIN, client_1.Role.CONTENT_EDITOR), courseController.publishCourse);
exports.default = router;
