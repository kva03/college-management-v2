/*
  Warnings:

  - You are about to drop the column `time` on the `hallBooking` table. All the data in the column will be lost.
  - Added the required column `end` to the `hallBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `hallBooking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hallBooking" DROP COLUMN "time",
ADD COLUMN     "end" INTEGER NOT NULL,
ADD COLUMN     "start" INTEGER NOT NULL;
