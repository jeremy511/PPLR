-- CreateEnum
CREATE TYPE "public"."ShiftStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."Shift" ADD COLUMN     "zoneId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Shift" ADD CONSTRAINT "Shift_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "public"."Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
