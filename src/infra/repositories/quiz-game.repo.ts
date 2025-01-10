import { Injectable } from "@nestjs/common";
import { QuizGameAggregate, QuizGameState } from "src/domain/quiz-game/quiz-game.agg";
import { IQuizGameRepository } from "src/domain/quiz-game/quiz-game.repo.i";
import { PrismaService } from "../common/prisma.service";
import { DomainEventDispatcher } from "src/common/domain/domain-event-dispatcher";
import { $Enums } from "@prisma/client";
import { DomainError } from "src/common/error/domain.error";
import { QuestionEntity } from "src/domain/quiz-game/question.entity";
import { OptionValueObject } from "src/domain/quiz-game/option.vo";
import { Metric, QuizThresholdEntity } from "src/domain/quiz-game/quiz-threshold.entity";
import { PrizeValueObject } from "src/domain/quiz-game/prize.vo";

@Injectable()
export class QuizGameRepository extends IQuizGameRepository {
    constructor(
        private readonly prismaService: PrismaService,
        domainEventDispatcher: DomainEventDispatcher
    ) {
        super(domainEventDispatcher);
    }

    protected async _save(agg: QuizGameAggregate): Promise<void> {
        const quizGame = await this.prismaService.quizGame.findFirst({
            where: { gameOfEventId: agg.id }
        });
        if (quizGame == null) {
            const { questions, quizThresholds, ...createProps } = agg.props;
            await this.prismaService.quizGame.create({
                data: {
                    gameOfEventId: agg.id,
                    ...createProps,
                    state: agg.props.state as unknown as $Enums.QuizGameState,
                    Question: {
                        create: questions.map(q => ({
                            id: q.id,
                            content: q.props.content,
                            Option: {
                                create: q.props.options.map(o => ({
                                    choice: o.props.choice,
                                    content: o.props.content,
                                    isCorrect: o.props.isCorrect
                                }))
                            }
                        }))
                    },
                    QuizThreshold: {
                        create: quizThresholds.map(t => ({
                            id: t.id,
                            threshold: t.props.threshold,
                            metric: t.props.metric as unknown as $Enums.Metric,
                            Prize: {
                                create: t.props.prizes.map(p => ({
                                    promotionId: p.props.promotionId,
                                    amount: p.props.amount
                                }))
                            }
                        }))
                    }
                },
            });
        }
        else {
            await this.prismaService.quizGame.update({
                where: { gameOfEventId: agg.id },
                data: {
                    secondPerQuestion: agg.props.secondPerQuestion,
                    questionIndex: agg.props.questionIndex,
                    state: agg.props.state as unknown as $Enums.QuizGameState,
                }
            });
        }
    }

    async getById(gameOfEventId: string): Promise<QuizGameAggregate> {
        const res = await this.prismaService.quizGame.findUnique({
            where: {
                gameOfEventId
            },
            include: {
                Question: {
                    include: { Option: true }
                },
                QuizThreshold: {
                    include: { Prize: true }
                }
            }
        });
        if (res == null) {
            throw new DomainError(`Quiz game with ID "${gameOfEventId}" not found.`);
        }
        const questions = res.Question.map(q => new QuestionEntity({
            content: q.content,
            options: q.Option.map(o => new OptionValueObject({
                choice: o.choice,
                content: o.content,
                isCorrect: o.isCorrect
            }))
        }, q.id));
        const quizThresholds = res.QuizThreshold.map(t => new QuizThresholdEntity({
            threshold: t.threshold,
            metric: t.metric as unknown as Metric,
            prizes: t.Prize.map(p => new PrizeValueObject({
                promotionId: p.promotionId,
                amount: p.amount
            }))
        }, t.id));
        return new QuizGameAggregate({
            ...res,
            state: res.state as unknown as QuizGameState,
            questions,
            quizThresholds
        }, res.gameOfEventId);
    }

    async delete(id: string): Promise<void> {
        await this.prismaService.quizGame.delete({
            where: { gameOfEventId: id }
        });
    }
}