import prisma from '../../config/prisma';
import { Course, CourseDifficulty, CourseStatus, Prisma } from '@prisma/client';

export class CourseRepository {
  async create(data: {
    slug: string;
    title: string;
    description?: string;
    difficulty: CourseDifficulty;
    estimatedHours: number;
    totalXp: number;
    previewVideoUrl?: string;
    thumbnailUrl?: string;
    stepsDefinition: any;
    createdById: string;
  }): Promise<Course> {
    return prisma.course.create({
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }

  async findMany(params: {
    skip: number;
    take: number;
    where?: Prisma.CourseWhereInput;
    orderBy?: Prisma.CourseOrderByWithRelationInput;
  }) {
    return prisma.course.findMany({
      ...params,
      where: {
        ...params.where,
        deletedAt: null,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }

  async count(where?: Prisma.CourseWhereInput): Promise<number> {
    return prisma.course.count({
      where: {
        ...where,
        deletedAt: null,
      },
    });
  }

  async findBySlug(slug: string): Promise<Course | null> {
    return prisma.course.findUnique({
      where: { slug, deletedAt: null },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<Course | null> {
    return prisma.course.findUnique({
      where: { id, deletedAt: null },
    });
  }

  async update(
    id: string,
    data: Prisma.CourseUpdateInput
  ): Promise<Course> {
    return prisma.course.update({
      where: { id },
      data,
    });
  }

  async publish(id: string): Promise<Course> {
    return prisma.course.update({
      where: { id },
      data: {
        status: CourseStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }
}