"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateXpForStep = calculateXpForStep;
exports.calculateLevel = calculateLevel;
function calculateXpForStep(step, userScore) {
    const baseXp = step.xp || 10;
    let bonusXp = 0;
    // Perfect score bonus (10%)
    if (userScore === 100) {
        bonusXp = Math.floor(baseXp * 0.1);
    }
    return {
        baseXp,
        bonusXp,
        totalXp: baseXp + bonusXp,
    };
}
function calculateLevel(totalXp) {
    // Simple leveling: level = floor(sqrt(totalXp / 100)) + 1
    return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}
