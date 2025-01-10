import { DomainEventBase } from "src/common/domain/domain-event.i";

export class QuizGameCreatedDomainEvent extends DomainEventBase {
    constructor(
        public readonly gameOfEventId: string,
        public readonly startTime: Date
    ) {
        super();
    }
}