import ICommand from "src/common/app/command.i";
import { CreateQuizParam } from "./create-quiz.param";
import { Injectable } from "@nestjs/common";
import { QuestionEntity } from "src/domain/quiz-game/question.entity";
import { QuizThresholdEntity } from "src/domain/quiz-game/quiz-threshold.entity";
import { QuizGameAggregate } from "src/domain/quiz-game/quiz-game.agg";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { IQuizGameRepository } from "src/domain/quiz-game/quiz-game.repo.i";

@Injectable()
export class CreateQuizCommand implements ICommand<CreateQuizParam> {
    constructor(
        private readonly unitOfWork: IUnitOfWork
    ) { }

    async execute(param: CreateQuizParam): Promise<void> {
        console.log("CreateQuizCommand.execute");
        const { gameOfEventId, questions, quizThresholds, secondPerQuestion, startTime } = param;
        const questionEntities = questions.map(question => QuestionEntity.create(question));
        const quizThresholdEntities = quizThresholds.map(threshold => QuizThresholdEntity.create(threshold));
        const quizGame = QuizGameAggregate.create(gameOfEventId, questionEntities, quizThresholdEntities, startTime, secondPerQuestion);
        await this.unitOfWork.getRepository(IQuizGameRepository).save(quizGame);
    }
}