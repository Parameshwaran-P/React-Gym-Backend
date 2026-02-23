"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterStepDefinition = filterStepDefinition;
exports.filterCourseSteps = filterCourseSteps;
function filterStepDefinition(step, stepType) {
    // Clone to avoid mutating original
    const filtered = { ...step };
    switch (stepType) {
        case 'quiz':
        case 'code_battle':
            if (filtered.questions) {
                filtered.questions = filtered.questions.map((q) => {
                    const { correct, ...rest } = q;
                    return rest;
                });
            }
            break;
        case 'coding_task':
            if (filtered.tests) {
                filtered.tests = filtered.tests.map((t) => {
                    const { solution, ...rest } = t;
                    return rest;
                });
            }
            break;
        default:
            // No filtering needed for markdown, etc.
            break;
    }
    return filtered;
}
function filterCourseSteps(stepsDefinition) {
    const filtered = {};
    for (const [key, step] of Object.entries(stepsDefinition)) {
        const stepData = step;
        filtered[key] = filterStepDefinition(stepData, stepData.type);
    }
    return filtered;
}
