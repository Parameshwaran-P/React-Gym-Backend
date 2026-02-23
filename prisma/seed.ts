import { PrismaClient, CourseDifficulty } from '@prisma/client';
import { hashPassword } from '../src/common/utils/password.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      displayName: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample course
  const course = await prisma.course.create({
    data: {
      slug: 'typescript-basics',
      title: 'TypeScript Basics',
      description: 'Learn the fundamentals of TypeScript',
      difficulty: CourseDifficulty.BEGINNER,
      estimatedHours: 10,
      totalXp: 500,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      createdById: admin.id,
      stepsDefinition: {
        refresher: {
          type: 'markdown',
          title: 'TypeScript Introduction',
          content: '# Welcome to TypeScript\n\nTypeScript is a typed superset of JavaScript.',
          xp: 50,
        },
        quiz1: {
          type: 'quiz',
          title: 'Basic Types Quiz',
          question: 'What is the type of `const x = 5;`?',
          options: [
            { id: 'a', text: 'number' },
            { id: 'b', text: 'string' },
            { id: 'c', text: 'any' },
          ],
          correct: 'a',
          xp: 100,
        },
        battle1: {
          type: 'code_battle',
          title: 'Type Annotations Battle',
          enemy: { name: 'Type Error Monster', health: 100 },
          questions: [
            {
              question: 'Which annotation is correct?',
              options: ['const x: number = 5;', 'const x: string = 5;'],
              correct: 'const x: number = 5;',
            },
          ],
          xp: 150,
        },
        task: {
          type: 'coding_task',
          title: 'Create a Function',
          instructions: 'Write a function that adds two numbers',
          starterCode: 'function add(a: number, b: number): number {\n  // TODO\n}',
          tests: [
            { input: [2, 3], expected: 5 },
            { input: [0, 0], expected: 0 },
          ],
          xp: 200,
        },
      },
    },
  });

  console.log('✅ Sample course created:', course.title);

  // Create tags
  const tag = await prisma.tag.create({
    data: {
      name: 'TypeScript',
      slug: 'typescript',
    },
  });

  await prisma.courseTag.create({
    data: {
      courseId: course.id,
      tagId: tag.id,
    },
  });

  console.log('✅ Tags created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });