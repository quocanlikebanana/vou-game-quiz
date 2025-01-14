import ICommand from "src/common/app/command.i";
import { JoinQuizParam } from "./join-quiz.param";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { IUserQuizRepository } from "src/domain/user-quiz/user-quiz.repo";
import { UserQuizAggregate } from "src/domain/user-quiz/user-quiz.agg";
import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { AxiosError } from "axios";
import { DomainError } from "src/common/error/domain.error";

@Injectable()
export class JoinQuizCommand implements ICommand<JoinQuizParam, { userQuizId: string }> {
    constructor(
        private readonly unitOfWork: IUnitOfWork,
        private readonly httpService: HttpService
    ) { }

    async execute(param: JoinQuizParam): Promise<{ userQuizId: string }> {
        const userQuizRepository = this.unitOfWork.getRepository(IUserQuizRepository);
        const { userId, gameOfEventId } = param;

        // Reduce turn on Event server
        const eventUrl = process.env.EVENT_URL;
        if (!eventUrl) {
            throw new DomainError('Is not connected to event');
        }
        try {
            const body = { userId, gameOfEventId, turn: 1 };
            const endpoint = `${eventUrl}/system/reduce-turn`;
            console.log(`Send request: `, endpoint, body);
            await this.httpService.axiosRef.post(endpoint, body);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.status === 400) {
                    throw new DomainError(error.message);
                }
            }
        }

        const userQuiz = UserQuizAggregate.create(userId, gameOfEventId);
        await userQuizRepository.save(userQuiz);
        console.log(`User ${userId} created`);
        return { userQuizId: userQuiz.id };
    }
}