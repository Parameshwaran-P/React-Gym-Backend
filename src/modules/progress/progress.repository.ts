import prisma from '../../config/prisma';
import { CourseProgress, ProgressStatus, Prisma } from '@prisma/client';

export class ProgressRepository {
  async findProgress(
    userId: string,
    courseId: string,
    tx?: Prisma.TransactionClient
  ): Promise<CourseProgress | null> {
    const client = tx || prisma;
    return client.courseProgress.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  }

  async upsertProgress(
    data: {
      userId: string;
      courseId: string;
      status?: ProgressStatus;
      stepsProgress?: any;
      completionRate?: number;
      totalSteps?: number;
      completedSteps?: number;
      xpEarned?: number;
      courseVersion?: number;
      startedAt?: Date;
      completedAt?: Date | null;
      lastAccessedAt?: Date;
    },
    tx?: Prisma.TransactionClient
  ): Promise<CourseProgress> {
    const client = tx || prisma;

    const updateData: any = { ...data };
    delete updateData.userId;
    delete updateData.courseId;

    return client.courseProgress.upsert({
      where: {
        userId_courseId: {
          userId: data.userId,
          courseId: data.courseId,
        },
      },
      update: updateData,
      create: data,
    });
  }
}