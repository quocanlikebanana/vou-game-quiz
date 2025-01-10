import { Injectable } from "@nestjs/common";
import { IDomainEventHandler } from "src/common/domain/domain-event-handler.i";
import { QuizGameEndedDomainEvent } from "src/domain/quiz-game/domain-events/quiz-game-ended.de";
import { PrismaService } from "src/infra/common/prisma.service";
import { evaluateScore } from "../../../domain/helper/evaluateScore";
import { IScheduleService } from "src/domain/services/schedule-service.t";
import { EventEmitter2 } from "@nestjs/event-emitter";


@Injectable()
export class QuizGameEndedDomainEventHandler implements IDomainEventHandler<QuizGameEndedDomainEvent> {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2,
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
        const game = await this.prismaService.quizGame.findUnique({
            where: {
                gameOfEventId: event.gameOfEventId
            }
        });
        const userResults: {
            userQuizId: string,
            score: number,
            top: number,
        }[] = [];
        const userQuizWithScore = userQuizes.map(userQuiz => {
            const score = userQuiz.User_Choose_Option.reduce((acc, userChooseOption) => {
                return acc + evaluateScore(userChooseOption.Option.isCorrect, userChooseOption.timeAnswered, game.secondPerQuestion);
            }, 0);
            return {
                id: userQuiz.id,
                score,
            };
        });
        const sortedUserQuizWithScore = userQuizWithScore.sort((a, b) => b.score - a.score);
        sortedUserQuizWithScore.forEach((userQuiz, index) => {
            userResults.push({
                userQuizId: userQuiz.id,
                score: userQuiz.score,
                top: index + 1,
            });
        });
        await this.prismaService.userResult.createMany({
            data: userResults.map(userResult => ({
                ...userResult
            }))
        });

        this.eventEmitter.emit("quiz-game.ended", event);

        // Todo: add promotion to users
    }
}

