/*
  Warnings:

  - The `status` column on the `Shift` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Shift" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ShiftStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "public"."AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,
    "publisherId" INTEGER,
    "shiftId" INTEGER,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
