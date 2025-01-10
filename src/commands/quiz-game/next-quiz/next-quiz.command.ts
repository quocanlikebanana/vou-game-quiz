import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import ICommand from "src/common/app/command.i";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { IQuizGameRepository } from "src/domain/quiz-game/quiz-game.repo.i";

@Injectable()
export class NextQuizCommand implements ICommand<{ gameOfEventId: string }> {
    constructor(
        private readonly unitOfWork: IUnitOfWork,
    ) { }

    @OnEvent("quiz-game.before-nexted")
    async execute(param: { gameOfEventId: string; }): Promise<void> {
        console.log("NextQuizCommand.execute");
        const { gameOfEventId } = param;
        const quizGameRepository = this.unitOfWork.getRepository(IQuizGameRepository);
        const quizGame = await quizGameRepository.getById(gameOfEventId);
        quizGame.nextQuestion();
        await quizGameRepository.save(quizGame);
    }
}