import IReader from "src/common/app/reader.i";
import { PrismaService } from "src/infra/common/prisma.service";
import { Injectable } from "@nestjs/common";
import { EvaluateUserAnswerParam } from "./evaluate-user-answer.param";
import { EvaluateUserAnswerPresenter } from "./evaluate-user-answer.presenter";
import { evaluateScore } from "src/domain/helper/evaluateScore";

@Injectable()
export class EvaluateUserAnswerReader implements IReader<EvaluateUserAnswerParam, EvaluateUserAnswerPresenter | null> {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async read(param: EvaluateUserAnswerParam): Promise<EvaluateUserAnswerPresenter | null> {
        const { userId, gameOfEventId } = param;
        const quizGame = await this.prismaService.quizGame.findUnique({
            where: { gameOfEventId }
        });
        if (quizGame == null || quizGame.questionIndex <= 0) {
            return null;
        }
        const result = await this.prismaService.user_Choose_Option.findFirst({
            where: {
                UserQuiz: {
                    userId,
                    gameOfEventId
                },
            },
            orderBy: {
                questionId: 'asc'
            },
            take: 1,
            skip: quizGame.questionIndex - 1,
            include: {
                Option: true,
                UserQuiz: {
                    include: {
                        QuizGame: true
                    }
                }
            }
        });
        if (result == null) {
            return {
                questionId: result.questionId,
                isCorrect: false,
                isAnswered: false,
                score: 0
            }
        } else {
            const score = evaluateScore(result.Option.isCorrect, result.timeAnswered, result.UserQuiz.QuizGame.secondPerQuestion);
            return {
                questionId: result.questionId,
                isCorrect: result.Option.isCorrect,
                isAnswered: true,
                score,
            }
        }
    }
}