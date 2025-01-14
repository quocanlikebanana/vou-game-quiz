-- CreateTable
CREATE TABLE "UserResult_Prize" (
    "id" TEXT NOT NULL,
    "userResultId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "UserResult_Prize_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserResult_Prize" ADD CONSTRAINT "UserResult_Prize_userResultId_fkey" FOREIGN KEY ("userResultId") REFERENCES "UserResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
