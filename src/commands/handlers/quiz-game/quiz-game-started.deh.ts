import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { NextQuizCommand } from "src/commands/quiz-game/next-quiz/next-quiz.command";
import { IDomainEventHandler } from "src/common/domain/domain-event-handler.i";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { QuizGameStartedDomainEvent } from "src/domain/quiz-game/domain-events/quiz-game-started.de";
import { IQuizGameRepository } from "src/domain/quiz-game/quiz-game.repo.i";
import { IScheduleService } from "src/domain/services/schedule-service.t";

const BREAK_TIME = 5; // seconds

@Injectable()
export class QuizGameStartedDomainEventHandler implements IDomainEventHandler<QuizGameStartedDomainEvent> {
    constructor(
        private readonly scheduleService: IScheduleService,
        private readonly eventemitter: EventEmitter2,
        private readonly unitOfWork: IUnitOfWork,
    ) { }

    async handle(event: QuizGameStartedDomainEvent): Promise<void> {
        if (event.restart == true) {
            const quizGameRepository = this.unitOfWork.getRepository(IQuizGameRepository);
            const quizGame = await quizGameRepository.getById(event.gameOfEventId);
            quizGame.reset();
            quizGame.start();
            await quizGameRepository.save(quizGame);
        } else {
            this.scheduleService.scheduleInterval(event.gameOfEventId, BREAK_TIME, async () => {
                this.eventemitter.emit("quiz-game.before-nexted", { gameOfEventId: event.gameOfEventId });
            }, true);
            this.eventemitter.emit("quiz-game.started", event);
        }
    }
}