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
            const gameUrl = process.env.GAME_URL;
            if (!gameUrl) {
                throw new DomainError('Is not set game url');
            }
            const gameEndpoint = `${gameUrl}/game-event/unauth/detail/${gameOfEventId}`;
            const gameInfo = await this.httpService.axiosRef.get(gameEndpoint);
            if (!gameInfo.data || gameInfo.data.eventId == null) {
                throw new DomainError('Game not found');
            }
            const eventId = gameInfo.data.eventId;
            const body = { userId, eventId, turn: 1 };
            const eventEndpoint = `${eventUrl}/system/reduce-turn`;
            console.log(`Send request: `, eventEndpoint, body);
            await this.httpService.axiosRef.post(eventEndpoint, body);
        } catch (error) {
            if (error instanceof AxiosError) {
                throw new DomainError(error.message);
            }
        }

        const userQuiz = UserQuizAggregate.create(userId, gameOfEventId);
        await userQuizRepository.save(userQuiz);
        console.log(`User ${userId} created`);
        return { userQuizId: userQuiz.id };
    }
}