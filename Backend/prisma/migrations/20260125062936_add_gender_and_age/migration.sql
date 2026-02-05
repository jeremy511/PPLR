-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable
ALTER TABLE "public"."Publisher" ADD COLUMN     "age" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "gender" "public"."Gender" NOT NULL DEFAULT 'MALE';

-- AlterTable
ALTER TABLE "public"."ShiftPublisher" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
