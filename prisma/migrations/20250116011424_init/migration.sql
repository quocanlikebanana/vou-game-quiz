/*
  Warnings:

  - A unique constraint covering the columns `[userQuizId]` on the table `UserResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserResult_userQuizId_key" ON "UserResult"("userQuizId");
