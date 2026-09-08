/*
  Warnings:

  - Added the required column `createdById` to the `faculty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "faculty" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "faculty" ADD CONSTRAINT "faculty_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
