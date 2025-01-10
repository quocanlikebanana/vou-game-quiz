import { Injectable } from "@nestjs/common";
import ICommand from "src/common/app/command.i";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { DomainError } from "src/common/error/domain.error";
import { IQuizGameRepository } from "src/domain/quiz-game/quiz-game.repo.i";

@Injectable()
export class DeleteQuizCommand implements ICommand<{ gameOfEventId: string }> {
    constructor(
        private readonly unitOfWork: IUnitOfWork
    ) { }

    async execute(param: { gameOfEventId: string; }): Promise<void> {
        const quizGame = await this.unitOfWork.getRepository(IQuizGameRepository).getById(param.gameOfEventId);
        if (!quizGame) {
            throw new DomainError(`Quiz game with id ${param.gameOfEventId} not found`);
        }
        await this.unitOfWork.getRepository(IQuizGameRepository).delete(param.gameOfEventId);
    }
}