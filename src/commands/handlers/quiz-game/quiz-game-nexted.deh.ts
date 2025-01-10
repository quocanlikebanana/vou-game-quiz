import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { NextQuizCommand } from "src/commands/quiz-game/next-quiz/next-quiz.command";
import { IDomainEventHandler } from "src/common/domain/domain-event-handler.i";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { QuizGameNextedDomainEvent } from "src/domain/quiz-game/domain-events/quiz-game-nexted.de";
import { IScheduleService } from "src/domain/services/schedule-service.t";

@Injectable()
export class QuizGameNextedDomainEventHandler implements IDomainEventHandler<QuizGameNextedDomainEvent> {
    constructor(
        private readonly scheduleService: IScheduleService,
        private readonly eventemitter: EventEmitter2,
    ) { }

    async handle(event: QuizGameNextedDomainEvent): Promise<void> {
        console.log("QuizGameNextedDomainEventHandler.handle: " + event.questionIndex);
        this.scheduleService.scheduleInterval(event.gameOfEventId, event.secondsPerQuestion, () => {
            this.eventemitter.emit("quiz-game.before-nexted", { gameOfEventId: event.gameOfEventId });
        }, true);
        if (event.questionIndex > 0) {
            this.eventemitter.emit("quiz-game.evaluate-users", event)
        }
        this.eventemitter.emit("quiz-game.display", event);
    }
}