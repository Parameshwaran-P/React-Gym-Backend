"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const errors_1 = require("@/common/errors");
function validate(schema) {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const details = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                next(new errors_1.ValidationError('Validation failed', details));
            }
            else {
                next(error);
            }
        }
    };
}
