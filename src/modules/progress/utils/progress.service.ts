import { ProgressRepository } from '../progress.repository';
import { NotFoundError, ConflictError } from '../../../common/errors/AppError';
import { CompleteStepInput } from '../progress.validation';
import { calculateXpForStep, calculateLevel } from '../utils/xpCalculator.util';
import { updateStreak } from '../utils/streakCalculator.util';
import prisma from '../../../config/prisma';
import { XpReason } from '@prisma/client';

export class ProgressService {
  private progressRepository: ProgressRepository;

  constructor() {
    this.progressRepository = new ProgressRepository();
  }

  async completeStep(input: CompleteStepInput, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch course
      const course = await tx.course.findUnique({
        where: { id: input.courseId, deletedAt: null },
      });

      if (!course) {
        throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
      }

      // 2. Validate step exists
      const stepsDefinition = course.stepsDefinition as any;
      const stepDef = stepsDefinition[input.stepKey];

      if (!stepDef) {
        throw new NotFoundError('Step not found', 'STEP_NOT_FOUND');
      }

      // 3. Get or create progress
      let progress = await this.progressRepository.findProgress(userId, input.courseId, tx);

      const isNewCourse = !progress;

      if (!progress) {
        progress = await this.progressRepository.upsertProgress(
          {
            userId,
            courseId: input.courseId,
            courseVersion: course.version,
            startedAt: new Date(),
            lastAccessedAt: new Date(),
            totalSteps: Object.keys(stepsDefinition).length,
          },
          tx
        );
      }

      // 4. Check if already completed
      const stepsProgress = (progress.stepsProgress as any) || {};
      const currentStepProgress = stepsProgress[input.stepKey];

      if (currentStepProgress?.status === 'COMPLETED') {
        throw new ConflictError('Step already completed', 'STEP_ALREADY_COMPLETED');
      }

      // 5. Calculate XP
      const { baseXp, bonusXp, totalXp } = calculateXpForStep(stepDef, input.score);

      // 6. Update step progress
      const updatedStepsProgress = {
        ...stepsProgress,
        [input.stepKey]: {
          status: 'COMPLETED',
          attempts: (currentStepProgress?.attempts || 0) + 1,
          completedAt: new Date().toISOString(),
          score: input.score,
          timeSpent: input.timeSpent,
        },
      };

      // 7. Calculate completion
      const totalSteps = Object.keys(stepsDefinition).length;
      const completedSteps = Object.values(updatedStepsProgress).filter(
        (s: any) => s.status === 'COMPLETED'
      ).length;
      const completionRate = Math.floor((completedSteps / totalSteps) * 100);

      // 8. Update progress
      progress = await this.progressRepository.upsertProgress(
        {
          userId,
          courseId: input.courseId,
          stepsProgress: updatedStepsProgress,
          completedSteps,
          totalSteps,
          completionRate,
          xpEarned: progress.xpEarned + totalXp,
          status: completionRate === 100 ? 'COMPLETED' : 'IN_PROGRESS',
          completedAt: completionRate === 100 ? new Date() : null,
          lastAccessedAt: new Date(),
        },
        tx
      );

      // 9. Award XP
      await tx.xpTransaction.create({
        data: {
          userId,
          amount: totalXp,
          reason: XpReason.STEP_COMPLETED,
          description: `Completed ${stepDef.title || input.stepKey}`,
          referenceType: 'step',
          referenceId: input.stepKey,
          metadata: {
            courseId: input.courseId,
            stepKey: input.stepKey,
            score: input.score,
            baseXp,
            bonusXp,
          },
        },
      });

      // 10. Update user total XP
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: totalXp },
        },
      });

      // Calculate new level
      const newLevel = calculateLevel(user.totalXp);
      if (newLevel > user.level) {
        await tx.user.update({
          where: { id: userId },
          data: { level: newLevel },
        });
      }

      // 11. Update streak
      const streakResult = await updateStreak(userId, 'step_completed', input.stepKey, tx);

      // 12. Course completion bonus
      let courseBonusXp = 0;
      if (completionRate === 100) {
        courseBonusXp = Math.floor(course.totalXp * 0.2);

        await tx.xpTransaction.create({
          data: {
            userId,
            amount: courseBonusXp,
            reason: XpReason.COURSE_COMPLETED,
            description: `Completed ${course.title}`,
            referenceType: 'course',
            referenceId: input.courseId,
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: {
            totalXp: { increment: courseBonusXp },
          },
        });
      }

      return {
        stepResult: {
          isCorrect: true,
          baseXp,
          bonusXp,
          totalXp,
        },
        courseProgress: {
          completionRate,
          completedSteps,
          totalSteps,
          courseCompleted: completionRate === 100,
          courseBonusXp,
        },
        userStats: {
          totalXp: user.totalXp + totalXp + courseBonusXp,
          level: calculateLevel(user.totalXp + totalXp + courseBonusXp),
          currentStreak: streakResult.currentStreak,
          streakUpdated: streakResult.updated,
        },
      };
    });
  }

  async getUserProgress(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    // Get courses in progress
    const coursesInProgress = await prisma.courseProgress.findMany({
      where: {
        userId,
        status: { in: ['IN_PROGRESS', 'COMPLETED'] },
      },
      include: {
        course: {
          select: {
            id: true,
            slug: true,
            title: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: { lastAccessedAt: 'desc' },
      take: 10,
    });

    // Get recent XP transactions
    const recentXp = await prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      user: {
        id: user.id,
        displayName: user.displayName,
        totalXp: user.totalXp,
        level: user.level,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      coursesInProgress: coursesInProgress.map(cp => ({
        courseId: cp.course.id,
        slug: cp.course.slug,
        title: cp.course.title,
        thumbnailUrl: cp.course.thumbnailUrl,
        completionRate: cp.completionRate,
        completedSteps: cp.completedSteps,
        totalSteps: cp.totalSteps,
        lastAccessedAt: cp.lastAccessedAt,
      })),
      recentXp: recentXp.map(xp => ({
        amount: xp.amount,
        reason: xp.reason,
        description: xp.description,
        createdAt: xp.createdAt,
      })),
    };
  }
}