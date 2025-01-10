import IReader from "src/common/app/reader.i";
import { QuestionDisplayParam } from "./question-display.param";
import { QuestionDisplayPresenter } from "./question-display.presenter";
import { PrismaService } from "src/infra/common/prisma.service";
import { QuizGameState } from "@prisma/client";
import { DomainError } from "src/common/error/domain.error";
import { Injectable } from "@nestjs/common";

@Injectable()
export class QuestionDisplayReader implements IReader<QuestionDisplayParam, QuestionDisplayPresenter> {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async read(param: QuestionDisplayParam): Promise<QuestionDisplayPresenter> {
        const resQuizGame = await this.prismaService.quizGame.findUnique({
            where: { gameOfEventId: param.gameOfEventId },
        });
        if (resQuizGame.state !== QuizGameState.Started || resQuizGame.questionIndex === -1) {
            throw new DomainError("Quiz is not started");
        }
        const resQuestion = await this.prismaService.question.findMany({
            where: {
                gameOfEventId: param.gameOfEventId,
            },
            orderBy: {
                id: 'asc',
            },
            take: 1,
            skip: resQuizGame.questionIndex,
            include: {
                Option: true,
            }
        });
        if (resQuestion.length === 0) {
            throw new DomainError("Question not found");
        }
        const res = resQuestion[0];
        return {
            id: res.id,
            content: res.content,
            options: res.Option.map(option => ({
                choice: option.choice,
                content: option.content,
            })),
        }
    }
}