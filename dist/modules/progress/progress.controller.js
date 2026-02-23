"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressController = void 0;
const progress_service_1 = require("../progress/utils/progress.service");
const response_util_1 = require("../../common/utils/response.util");
class ProgressController {
    constructor() {
        this.completeStep = async (req, res, next) => {
            try {
                const result = await this.progressService.completeStep(req.body, req.user.id);
                res.status(200).json((0, response_util_1.successResponse)(result));
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserProgress = async (req, res, next) => {
            try {
                const result = await this.progressService.getUserProgress(req.user.id);
                res.status(200).json((0, response_util_1.successResponse)(result));
            }
            catch (error) {
                next(error);
            }
        };
        this.progressService = new progress_service_1.ProgressService();
    }
}
exports.ProgressController = ProgressController;
