import { CourseRepository } from './course.repository';
import { NotFoundError, ForbiddenError } from '../../common/errors/AppError';
import { CreateCourseInput } from './course.validation';
import { Role, CourseDifficulty, CourseStatus } from '@prisma/client';
import { getPaginationParams, getSkipTake, getPaginationMeta } from '../../common/utils/pagination.util';
import { filterCourseSteps } from './utils/stepFilter.util';
import prisma from '../../config/prisma';

export class CourseService {
  private courseRepository: CourseRepository;

  constructor() {
    this.courseRepository = new CourseRepository();
  }

  async createCourse(input: CreateCourseInput, userId: string, userRole: Role) {
    // Authorization check
    if (userRole !== Role.ADMIN && userRole !== Role.CONTENT_EDITOR) {
      throw new ForbiddenError('Only admins and editors can create courses');
    }

    const course = await this.courseRepository.create({
      ...input,
      createdById: userId,
    });

    // Add tags if provided
    if (input.tags && input.tags.length > 0) {
      await this.addTagsToCourse(course.id, input.tags);
    }

    return course;
  }

  async getCourseList(params: {
    page?: string;
    limit?: string;
    difficulty?: CourseDifficulty;
    tag?: string;
    status?: CourseStatus;
  }, userId?: string, userRole?: Role) {
    const { page, limit } = getPaginationParams(params.page, params.limit);
    const { skip, take } = getSkipTake(page, limit);

    // Build where clause
    const where: any = {};

    // Non-admin users only see published courses
    if (userRole !== Role.ADMIN && userRole !== Role.CONTENT_EDITOR) {
      where.status = CourseStatus.PUBLISHED;
    } else if (params.status) {
      where.status = params.status;
    }

    if (params.difficulty) {
      where.difficulty = params.difficulty;
    }

    if (params.tag) {
      where.tags = {
        some: {
          tag: {
            slug: params.tag,
          },
        },
      };
    }

    const [courses, total] = await Promise.all([
      this.courseRepository.findMany({
        skip,
        take,
        where,
        orderBy: { orderIndex: 'asc' },
      }),
      this.courseRepository.count(where),
    ]);

    // Attach user progress if authenticated
    let progressMap: any = {};
    if (userId) {
      const courseIds = courses.map(c => c.id);
      const progress = await prisma.courseProgress.findMany({
        where: {
          userId,
          courseId: { in: courseIds },
        },
      });

      progressMap = progress.reduce((acc, p) => {
        acc[p.courseId] = p;
        return acc;
      }, {} as any);
    }

    const coursesWithProgress = courses.map(course => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      estimatedHours: course.estimatedHours,
      totalXp: course.totalXp,
      thumbnailUrl: course.thumbnailUrl,
      tags: (course as any).tags.map((ct: any) => ct.tag.name),
      status: course.status,
      userProgress: progressMap[course.id] ? {
        status: progressMap[course.id].status,
        completionRate: progressMap[course.id].completionRate,
      } : null,
    }));

    return {
      courses: coursesWithProgress,
      pagination: getPaginationMeta(page, limit, total),
    };
  }

  async getCourseBySlug(slug: string, userId?: string) {
    const course = await this.courseRepository.findBySlug(slug);

    if (!course) {
      throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
    }

    // Filter sensitive data from steps
    const filteredSteps = filterCourseSteps(course.stepsDefinition);

    // Get user progress if authenticated
    let userProgress = null;
    if (userId) {
      userProgress = await prisma.courseProgress.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId: course.id,
          },
        },
      });

      // Merge progress into steps
      if (userProgress) {
        const stepsProgressData = userProgress.stepsProgress as any;
        for (const [key, step] of Object.entries(filteredSteps)) {
          (step as any).userProgress = stepsProgressData[key] || { status: 'NOT_STARTED' };
        }
      }
    }

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      estimatedHours: course.estimatedHours,
      totalXp: course.totalXp,
      previewVideoUrl: course.previewVideoUrl,
      thumbnailUrl: course.thumbnailUrl,
      steps: filteredSteps,
      tags: (course as any).tags.map((ct: any) => ct.tag.name),
      createdBy: (course as any).createdBy,
      publishedAt: course.publishedAt,
      userProgress: userProgress ? {
        status: userProgress.status,
        completionRate: userProgress.completionRate,
        completedSteps: userProgress.completedSteps,
        totalSteps: userProgress.totalSteps,
        xpEarned: userProgress.xpEarned,
        startedAt: userProgress.startedAt,
      } : null,
    };
  }

  async publishCourse(courseId: string, userId: string, userRole: Role) {
    if (userRole !== Role.ADMIN && userRole !== Role.CONTENT_EDITOR) {
      throw new ForbiddenError('Only admins and editors can publish courses');
    }

    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      throw new NotFoundError('Course not found', 'COURSE_NOT_FOUND');
    }

    // Editors can only publish their own courses
    if (userRole === Role.CONTENT_EDITOR && course.createdById !== userId) {
      throw new ForbiddenError('You can only publish your own courses');
    }

    return this.courseRepository.publish(courseId);
  }

  private async addTagsToCourse(courseId: string, tagNames: string[]) {
    for (const tagName of tagNames) {
      const slug = tagName.toLowerCase().replace(/\s+/g, '-');

      // Get or create tag
      const tag = await prisma.tag.upsert({
        where: { slug },
        create: { name: tagName, slug },
        update: {},
      });

      // Link to course
      await prisma.courseTag.create({
        data: {
          courseId,
          tagId: tag.id,
        },
      });
    }
  }
}