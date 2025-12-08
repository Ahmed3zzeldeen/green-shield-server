/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `UploadedImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `UploadedImage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UploadedImage" ADD COLUMN     "key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UploadedImage_key_key" ON "UploadedImage"("key");
