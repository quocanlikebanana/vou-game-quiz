import { Injectable } from "@nestjs/common";
import AggregateRoot from "src/common/domain/aggregate.i";
import { UserChooseOptionValueObject } from "src/domain/user-quiz/user-choose-option.vo";
import { UserQuizAggregate, UserQuizProps } from "src/domain/user-quiz/user-quiz.agg";
import { IUserQuizRepository } from "src/domain/user-quiz/user-quiz.repo";
import { PrismaService } from "../common/prisma.service";
import { DomainEventDispatcher } from "src/common/domain/domain-event-dispatcher";

@Injectable()
export class UserQuizRepository extends IUserQuizRepository {
    constructor(
        private readonly prismaService: PrismaService,
        domainEventDispatcher: DomainEventDispatcher
    ) {
        super(domainEventDispatcher);
    }

    async getByUnique(userId: string, gameOfEventId: string): Promise<UserQuizAggregate> {
        const res = await this.prismaService.userQuiz.findUnique({
            where: {
                userId_gameOfEventId: {
                    userId,
                    gameOfEventId
                }
            },
            include: { User_Choose_Option: true }
        });
        if (!res) {
            return null;
        }
        const userQuiz = new UserQuizAggregate({
            userId: res.userId,
            gameOfEventId: res.gameOfEventId,
            userChooseOptions: res.User_Choose_Option.map(chooseOption => new UserChooseOptionValueObject({
                questionId: chooseOption.questionId,
                choice: chooseOption.choice,
                userQuizId: res.id,
                timeAnswered: chooseOption.timeAnswered
            }))
        }, res.id);
        return userQuiz;
    }

    async delete(userId: string, gameOfEventId: string): Promise<void> {
        await this.prismaService.userQuiz.delete({
            where: {
                userId_gameOfEventId: {
                    userId,
                    gameOfEventId
                }
            }
        });
    }

    async addChoosenOption(userQuiz: UserQuizAggregate, choosenOption: UserChooseOptionValueObject): Promise<void> {
        await this.prismaService.user_Choose_Option.create({
            data: {
                UserQuiz: {
                    connect: {
                        id: userQuiz.id
                    }
                },
                Option: {
                    connect: {
                        questionId_choice: {
                            choice: choosenOption.props.choice,
                            questionId: choosenOption.props.questionId,
                        }
                    }
                },
                timeAnswered: choosenOption.props.timeAnswered
            }
        });
    }

    protected async _save(agg: AggregateRoot<UserQuizProps>): Promise<void> {
        const userQuiz = await this.prismaService.userQuiz.findUnique({
            where: { id: agg.id }
        });
        if (userQuiz == null) {
            const { userChooseOptions, ...createProps } = agg.props;
            await this.prismaService.userQuiz.create({
                data: {
                    id: agg.id,
                    ...createProps,
                    User_Choose_Option: {
                        create: userChooseOptions.map(o => ({
                            questionId: o.props.questionId,
                            choice: o.props.choice,
                            timeAnswered: o.props.timeAnswered
                        }))
                    }
                }
            });
        } else {
            await this.prismaService.userQuiz.update({
                where: { id: agg.id },
                data: {
                    ...agg.props,
                    User_Choose_Option: {
                        deleteMany: {},
                        create: agg.props.userChooseOptions.map(o => ({
                            questionId: o.props.questionId,
                            choice: o.props.choice,
                            timeAnswered: o.props.timeAnswered
                        }))
                    }
                }
            });
        }
    }
}