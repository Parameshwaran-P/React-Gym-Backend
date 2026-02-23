"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const course_service_1 = require("./course.service");
const response_util_1 = require("../../common/utils/response.util");
class CourseController {
    constructor() {
        this.createCourse = async (req, res, next) => {
            try {
                const result = await this.courseService.createCourse(req.body, req.user.id, req.user.role);
                res.status(201).json((0, response_util_1.successResponse)(result));
            }
            catch (error) {
                next(error);
            }
        };
        this.getCourseList = async (req, res, next) => {
            try {
                const result = await this.courseService.getCourseList(req.query, req.user?.id, req.user.role);
                res.status(200).json((0, response_util_1.successResponse)(result.courses, { pagination: result.pagination }));
            }
            catch (error) {
                next(error);
            }
        };
        this.getCourseBySlug = async (req, res, next) => {
            try {
                const result = await this.courseService.getCourseBySlug(req.params.slug, req.user?.id);
                res.status(200).json((0, response_util_1.successResponse)({ course: result }));
            }
            catch (error) {
                next(error);
            }
        };
        this.publishCourse = async (req, res, next) => {
            try {
                const result = await this.courseService.publishCourse(req.params.courseId, req.user.id, req.user.role);
                res.status(200).json((0, response_util_1.successResponse)({ course: result }));
            }
            catch (error) {
                next(error);
            }
        };
        this.courseService = new course_service_1.CourseService();
    }
}
exports.CourseController = CourseController;
