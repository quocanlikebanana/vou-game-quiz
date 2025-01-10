import IReader from "src/common/app/reader.i";
import { QuizGameInfoParam } from "./quiz-game-info.param";
import { QuizGameInfoPresenter } from "./quiz-game-info.presenter";
import { PrismaService } from "src/infra/common/prisma.service";
import { Injectable } from "@nestjs/common";
import { DomainError } from "src/common/error/domain.error";

@Injectable()
export class QuizGameInfoReader implements IReader<QuizGameInfoParam, QuizGameInfoPresenter> {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async read(param: QuizGameInfoParam): Promise<QuizGameInfoPresenter> {
        const res = await this.prismaService.quizGame.findUnique({
            where: {
                gameOfEventId: param.gameOfEventId
            },
        });
        if (res == null) {
            throw new DomainError("Quiz game not found");
        }
        const numberOfQuestions = await this.prismaService.question.count({ where: { gameOfEventId: res.gameOfEventId } });
        return {
            ...res,
            numberOfQuestions
        };
    }
}