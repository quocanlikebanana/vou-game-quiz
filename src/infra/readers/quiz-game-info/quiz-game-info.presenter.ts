import { QuizGameState } from "@prisma/client";

export type QuizGameInfoPresenter = {
    gameOfEventId: string;
    startTime: Date;
    secondPerQuestion: number;
    state: QuizGameState;
    numberOfQuestions: number;
}