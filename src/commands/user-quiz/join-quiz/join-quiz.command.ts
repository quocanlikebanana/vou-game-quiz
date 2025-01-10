import ICommand from "src/common/app/command.i";
import { JoinQuizParam } from "./join-quiz.param";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { IUserQuizRepository } from "src/domain/user-quiz/user-quiz.repo";
import { UserQuizAggregate } from "src/domain/user-quiz/user-quiz.agg";
import { Injectable } from "@nestjs/common";

@Injectable()
export class JoinQuizCommand implements ICommand<JoinQuizParam, { userQuizId: string }> {
    constructor(
        private readonly unitOfWork: IUnitOfWork,
    ) { }

    async execute(param: JoinQuizParam): Promise<{ userQuizId: string }> {
        const userQuizRepository = this.unitOfWork.getRepository(IUserQuizRepository);
        const { userId, gameOfEventId } = param;
        const userQuiz = UserQuizAggregate.create(userId, gameOfEventId);
        await userQuizRepository.save(userQuiz);
        console.log(`User ${userId} created`);
        return { userQuizId: userQuiz.id };
    }
}