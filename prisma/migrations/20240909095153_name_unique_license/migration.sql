/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `LicenseType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `LicenseType_name_key` ON `LicenseType`(`name`);
