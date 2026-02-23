-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'CONTENT_EDITOR', 'USER');

-- CreateEnum
CREATE TYPE "public"."CourseDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."XpReason" AS ENUM ('STEP_COMPLETED', 'COURSE_COMPLETED', 'STREAK_BONUS', 'DAILY_LOGIN', 'ACHIEVEMENT', 'PERFECT_SCORE', 'ADMIN_ADJUSTMENT');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."courses" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "difficulty" "public"."CourseDifficulty" NOT NULL,
    "estimated_hours" INTEGER NOT NULL,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "preview_video_url" TEXT,
    "thumbnail_url" TEXT,
    "steps_definition" JSONB NOT NULL,
    "status" "public"."CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course_tags" (
    "courseId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "course_tags_pkey" PRIMARY KEY ("courseId","tagId")
);

-- CreateTable
CREATE TABLE "public"."course_prerequisites" (
    "course_id" TEXT NOT NULL,
    "prerequisite_id" TEXT NOT NULL,

    CONSTRAINT "course_prerequisites_pkey" PRIMARY KEY ("course_id","prerequisite_id")
);

-- CreateTable
CREATE TABLE "public"."course_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "steps_progress" JSONB NOT NULL DEFAULT '{}',
    "completion_rate" INTEGER NOT NULL DEFAULT 0,
    "total_steps" INTEGER NOT NULL DEFAULT 0,
    "completed_steps" INTEGER NOT NULL DEFAULT 0,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "course_version" INTEGER NOT NULL DEFAULT 1,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "last_accessed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."xp_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "public"."XpReason" NOT NULL,
    "description" TEXT,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."streaks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_date" DATE NOT NULL,
    "activity_type" TEXT,
    "activity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "streaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unlock_rules" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unlock_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "public"."users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "public"."courses"("slug");

-- CreateIndex
CREATE INDEX "courses_slug_idx" ON "public"."courses"("slug");

-- CreateIndex
CREATE INDEX "courses_status_idx" ON "public"."courses"("status");

-- CreateIndex
CREATE INDEX "courses_difficulty_idx" ON "public"."courses"("difficulty");

-- CreateIndex
CREATE INDEX "courses_order_index_idx" ON "public"."courses"("order_index");

-- CreateIndex
CREATE INDEX "courses_created_by_id_idx" ON "public"."courses"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "public"."tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "public"."tags"("slug");

-- CreateIndex
CREATE INDEX "course_progress_user_id_status_idx" ON "public"."course_progress"("user_id", "status");

-- CreateIndex
CREATE INDEX "course_progress_course_id_idx" ON "public"."course_progress"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "course_progress_user_id_course_id_key" ON "public"."course_progress"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "xp_transactions_user_id_idx" ON "public"."xp_transactions"("user_id");

-- CreateIndex
CREATE INDEX "xp_transactions_created_at_idx" ON "public"."xp_transactions"("created_at");

-- CreateIndex
CREATE INDEX "xp_transactions_reason_idx" ON "public"."xp_transactions"("reason");

-- CreateIndex
CREATE INDEX "streaks_user_id_activity_date_idx" ON "public"."streaks"("user_id", "activity_date");

-- CreateIndex
CREATE UNIQUE INDEX "streaks_user_id_activity_date_key" ON "public"."streaks"("user_id", "activity_date");

-- CreateIndex
CREATE INDEX "unlock_rules_course_id_idx" ON "public"."unlock_rules"("course_id");

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."courses" ADD CONSTRAINT "courses_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_tags" ADD CONSTRAINT "course_tags_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_tags" ADD CONSTRAINT "course_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_prerequisites" ADD CONSTRAINT "course_prerequisites_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_prerequisites" ADD CONSTRAINT "course_prerequisites_prerequisite_id_fkey" FOREIGN KEY ("prerequisite_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_progress" ADD CONSTRAINT "course_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course_progress" ADD CONSTRAINT "course_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."xp_transactions" ADD CONSTRAINT "xp_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."streaks" ADD CONSTRAINT "streaks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unlock_rules" ADD CONSTRAINT "unlock_rules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
