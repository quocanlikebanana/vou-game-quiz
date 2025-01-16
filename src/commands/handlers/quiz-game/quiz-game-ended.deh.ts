import { Injectable } from "@nestjs/common";
import { IDomainEventHandler } from "src/common/domain/domain-event-handler.i";
import { QuizGameEndedDomainEvent } from "src/domain/quiz-game/domain-events/quiz-game-ended.de";
import { PrismaService } from "src/infra/common/prisma.service";
import { evaluateScore } from "../../../domain/helper/evaluateScore";
import { IScheduleService } from "src/domain/services/schedule-service.t";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { IQuizGameRepository } from "src/domain/quiz-game/quiz-game.repo.i";
import { Metric } from "src/domain/quiz-game/quiz-threshold.entity";
import { HttpService } from "@nestjs/axios";
import { DomainError } from "src/common/error/domain.error";
import { Axios, AxiosError } from "axios";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";


@Injectable()
export class QuizGameEndedDomainEventHandler implements IDomainEventHandler<QuizGameEndedDomainEvent> {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
        private readonly httpService: HttpService,
        private readonly unitOfWork: IUnitOfWork,
    ) { }

    async handle(event: QuizGameEndedDomainEvent): Promise<void> {
        console.log("QuizGameEndedDomainEventHandler.handle");
        this.eventEmitter.emit("quiz-game.evaluate-users", event)
        const userQuizes = await this.prismaService.userQuiz.findMany({
            where: {
                gameOfEventId: event.gameOfEventId
            },
            include: {
                User_Choose_Option: {
                    include: {
                        Option: true
                    }
                }
            }
        });
        const quizGameRepository = this.unitOfWork.getRepository(IQuizGameRepository);
        const game = await quizGameRepository.getById(event.gameOfEventId);
        const userResults: {
            userId: string,
            userQuizId: string,
            score: number,
            top: number,
        }[] = [];
        const userQuizWithScore = userQuizes.map(userQuiz => {
            const score = userQuiz.User_Choose_Option.reduce((acc, userChooseOption) => {
                return acc + evaluateScore(userChooseOption.Option.isCorrect, userChooseOption.timeAnswered, game.props.secondPerQuestion);
            }, 0);
            return {
                userId: userQuiz.userId,
                id: userQuiz.id,
                score,
            };
        });
        const sortedUserQuizWithScore = userQuizWithScore.sort((a, b) => b.score - a.score);
        sortedUserQuizWithScore.forEach((userQuiz, index) => {
            userResults.push({
                userId: userQuiz.userId,
                userQuizId: userQuiz.id,
                score: userQuiz.score,
                top: index + 1,
            });
        });

        const userResultEntities = userResults.map(async (userResult) => {
            return await this.prismaService.userResult.create({
                data: {
                    score: userResult.score,
                    top: userResult.top,
                    UserQuiz: {
                        connect: {
                            id: userResult.userQuizId
                        }
                    }
                }
            });
        });

        this.eventEmitter.emit("quiz-game.ended", event);

        for (const userResult of userResults) {
            const prizesScore = game.evaluate(userResult.score, Metric.SCORE);
            const prizesTop = game.evaluate(userResult.top, Metric.TOP);
            const prizes = prizesScore.concat(prizesTop);
            for (const prize of prizes) {
                await this.prismaService.userResult_Prize.create({
                    data: {
                        UserResult: {
                            connect: {
                                userQuizId: userResult.userQuizId
                            }
                        },
                        promotionId: prize.props.promotionId,
                        amount: prize.props.amount
                    }
                });

                // Send prize to user:
                const promotionUrl = process.env.PROMOTION_URL;
                if (promotionUrl == null) {
                    throw new DomainError("Is not set promotion url");
                }
                const assignEndpoint = `${promotionUrl}/promotion-unauth/assign`;
                for (let i = 0; i < prize.props.amount; i++) {
                    try {
                        await this.httpService.axiosRef.post(assignEndpoint, {
                            userId: userResult.userId,
                            promotionId: +prize.props.promotionId,
                        });
                    } catch (error) {
                        if (error instanceof AxiosError) {
                            throw new DomainError(error.message);
                        }
                    }
                }
            }
        }

    }
}

