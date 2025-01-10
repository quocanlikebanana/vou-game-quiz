import { DomainEventBase } from "src/common/domain/domain-event.i";

export class QuizGameEndedDomainEvent extends DomainEventBase {
    constructor(
        public readonly gameOfEventId: string,
        public readonly secondsPerQuestion: number,
        public readonly questionIndex: number,
    ) {
        super();
    }
}