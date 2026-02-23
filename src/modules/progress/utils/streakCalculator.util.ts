import prisma from '../../../config/prisma';
import { Prisma } from '@prisma/client';

export async function updateStreak(
  userId: string,
  activityType: string,
  activityId: string,
  tx?: Prisma.TransactionClient
): Promise<{ currentStreak: number; updated: boolean }> {
  const client = tx || prisma;

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
    return { currentStreak: user!.currentStreak, updated: false };
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

async function calculateCurrentStreak(
  userId: string,
  tx: Prisma.TransactionClient
): Promise<number> {
  const streaks = await tx.streak.findMany({
    where: { userId },
    orderBy: { activityDate: 'desc' },
  });

  if (streaks.length === 0) return 0;

  let streak = 0;
  let expectedDate = new Date();
  expectedDate.setHours(0, 0, 0, 0);

  for (const s of streaks) {
    const activityDate = new Date(s.activityDate);
    activityDate.setHours(0, 0, 0, 0);

    if (activityDate.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}