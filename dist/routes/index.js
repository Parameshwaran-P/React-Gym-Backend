"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const course_routes_1 = __importDefault(require("../modules/courses/course.routes"));
const progress_routes_1 = __importDefault(require("../modules/progress/progress.routes"));
const router = (0, express_1.Router)();
router.use('/auth', auth_routes_1.default);
router.use('/courses', course_routes_1.default);
router.use('/progress', progress_routes_1.default);
exports.default = router;
