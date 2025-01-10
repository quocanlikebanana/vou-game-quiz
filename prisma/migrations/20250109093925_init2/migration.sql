-- CreateTable
CREATE TABLE "JobSchedule" (
    "id" TEXT NOT NULL,
    "executionDate" TIMESTAMP(3) NOT NULL,
    "startedDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSchedule_pkey" PRIMARY KEY ("id")
);
