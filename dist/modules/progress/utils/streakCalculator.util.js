"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStreak = updateStreak;
const prisma_1 = __importDefault(require("@/config/prisma"));
async function updateStreak(userId, activityType, activityId, tx) {
    const client = tx || prisma_1.default;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Check if already recorded today
    const existingStreak = await client.streak.findUnique({
        where: {
            userId_activityDate: {
                userId,
                activityDate: today,
            },
        },
    });
    if (existingStreak) {
        // Already recorded today
        const user = await client.user.findUnique({ where: { id: userId } });
        return { currentStreak: user.currentStreak, updated: false };
    }
    // Record today's activity
    await client.streak.create({
        data: {
            userId,
            activityDate: today,
            activityType,
            activityId,
        },
    });
    // Calculate new streak
    const newStreak = await calculateCurrentStreak(userId, client);
    // Update user
    await client.user.update({
        where: { id: userId },
        data: {
            currentStreak: newStreak,
            longestStreak: newStreak,
            lastActiveAt: new Date(),
        },
    });
    return { currentStreak: newStreak, updated: true };
}
async function calculateCurrentStreak(userId, tx) {
    const streaks = await tx.streak.findMany({
        where: { userId },
        orderBy: { activityDate: 'desc' },
    });
    if (streaks.length === 0)
        return 0;
    let streak = 0;
    let expectedDate = new Date();
    expectedDate.setHours(0, 0, 0, 0);
    for (const s of streaks) {
        const activityDate = new Date(s.activityDate);
        activityDate.setHours(0, 0, 0, 0);
        if (activityDate.getTime() === expectedDate.getTime()) {
            streak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        }
        else {
            break;
        }
    }
    return streak;
}
