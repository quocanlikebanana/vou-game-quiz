import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import ICommand from "src/common/app/command.i";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { IQuizGameRepository } from "src/domain/quiz-game/quiz-game.repo.i";

@Injectable()
export class StartQuizCommand implements ICommand<{ gameOfEventId: string }> {
    constructor(
        private readonly unitOfWork: IUnitOfWork,
    ) { }

    @OnEvent("quiz-game.before-started")
    async execute(param: { gameOfEventId: string; }): Promise<void> {
        console.log("StartQuizCommand.execute");
        const quizGameRepository = this.unitOfWork.getRepository(IQuizGameRepository);
        const quizGame = await quizGameRepository.getById(param.gameOfEventId);
        quizGame.start();
        await quizGameRepository.save(quizGame);
    }
}