-- CreateEnum
CREATE TYPE "TeacherReviewAction" AS ENUM ('RETURNED', 'REVIEWED');

-- AlterEnum
ALTER TYPE "AttemptStatus" ADD VALUE 'REVIEWED';

-- CreateTable
CREATE TABLE "TeacherReview" (
    "id" UUID NOT NULL,
    "attemptId" UUID NOT NULL,
    "attemptVersionId" UUID NOT NULL,
    "teacherId" UUID NOT NULL,
    "action" "TeacherReviewAction" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherReview_attemptId_createdAt_idx" ON "TeacherReview"("attemptId", "createdAt");

-- AddForeignKey
ALTER TABLE "TeacherReview" ADD CONSTRAINT "TeacherReview_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherReview" ADD CONSTRAINT "TeacherReview_attemptVersionId_fkey" FOREIGN KEY ("attemptVersionId") REFERENCES "AttemptVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherReview" ADD CONSTRAINT "TeacherReview_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
