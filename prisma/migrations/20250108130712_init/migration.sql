-- CreateEnum
CREATE TYPE "Metric" AS ENUM ('Score', 'Top');

-- CreateEnum
CREATE TYPE "QuizGameState" AS ENUM ('NotStarted', 'Started', 'Ended');

-- CreateTable
CREATE TABLE "QuizGame" (
    "gameOfEventId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "secondPerQuestion" INTEGER NOT NULL,
    "questionIndex" INTEGER NOT NULL,
    "state" "QuizGameState" NOT NULL,

    CONSTRAINT "QuizGame_pkey" PRIMARY KEY ("gameOfEventId")
);

-- CreateTable
CREATE TABLE "QuizThreshold" (
    "id" TEXT NOT NULL,
    "gameOfEventId" TEXT NOT NULL,
    "threshold" INTEGER NOT NULL,
    "metric" "Metric" NOT NULL,

    CONSTRAINT "QuizThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prize" (
    "quizThresholdId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "Prize_pkey" PRIMARY KEY ("quizThresholdId","promotionId")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "gameOfEventId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "choice" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("questionId","choice")
);

-- CreateTable
CREATE TABLE "UserQuiz" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gameOfEventId" TEXT NOT NULL,

    CONSTRAINT "UserQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserResult" (
    "userQuizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "top" INTEGER NOT NULL,

    CONSTRAINT "UserResult_pkey" PRIMARY KEY ("userQuizId")
);

-- CreateTable
CREATE TABLE "User_Choose_Option" (
    "questionId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "userQuizId" TEXT NOT NULL,
    "timeAnswered" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "User_Choose_Option_pkey" PRIMARY KEY ("questionId","choice","userQuizId")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserQuiz_userId_gameOfEventId_key" ON "UserQuiz"("userId", "gameOfEventId");

-- AddForeignKey
ALTER TABLE "QuizThreshold" ADD CONSTRAINT "QuizThreshold_gameOfEventId_fkey" FOREIGN KEY ("gameOfEventId") REFERENCES "QuizGame"("gameOfEventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prize" ADD CONSTRAINT "Prize_quizThresholdId_fkey" FOREIGN KEY ("quizThresholdId") REFERENCES "QuizThreshold"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_gameOfEventId_fkey" FOREIGN KEY ("gameOfEventId") REFERENCES "QuizGame"("gameOfEventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuiz" ADD CONSTRAINT "UserQuiz_gameOfEventId_fkey" FOREIGN KEY ("gameOfEventId") REFERENCES "QuizGame"("gameOfEventId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserResult" ADD CONSTRAINT "UserResult_userQuizId_fkey" FOREIGN KEY ("userQuizId") REFERENCES "UserQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Choose_Option" ADD CONSTRAINT "User_Choose_Option_userQuizId_fkey" FOREIGN KEY ("userQuizId") REFERENCES "UserQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User_Choose_Option" ADD CONSTRAINT "User_Choose_Option_questionId_choice_fkey" FOREIGN KEY ("questionId", "choice") REFERENCES "Option"("questionId", "choice") ON DELETE CASCADE ON UPDATE CASCADE;
