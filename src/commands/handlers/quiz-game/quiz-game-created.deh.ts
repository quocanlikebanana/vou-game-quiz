import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { IDomainEventHandler } from "src/common/domain/domain-event-handler.i";
import { QuizGameCreatedDomainEvent } from "src/domain/quiz-game/domain-events/quiz-game-created.de";
import { IScheduleService } from "src/domain/services/schedule-service.t";

@Injectable()
export class QuizGameCreatedDomainEventHandler implements IDomainEventHandler<QuizGameCreatedDomainEvent> {
    constructor(
        private readonly scheduleService: IScheduleService,
        private readonly eventEmitter: EventEmitter2,
    ) { }

    async handle(event: QuizGameCreatedDomainEvent): Promise<void> {
        this.scheduleService.scheduleDate(event.gameOfEventId, event.startTime, async () => {
            this.eventEmitter.emit("quiz-game.before-started", { gameOfEventId: event.gameOfEventId });
        }, false);
    }
}