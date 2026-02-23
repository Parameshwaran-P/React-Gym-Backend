"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_util_1 = require("@/common/utils/response.util");
class AuthController {
    constructor() {
        this.register = async (req, res, next) => {
            try {
                const result = await this.authService.register(req.body);
                res.status(201).json((0, response_util_1.successResponse)(result));
            }
            catch (error) {
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const result = await this.authService.login(req.body);
                res.status(200).json((0, response_util_1.successResponse)(result));
            }
            catch (error) {
                next(error);
            }
        };
        this.authService = new auth_service_1.AuthService();
    }
}
exports.AuthController = AuthController;
