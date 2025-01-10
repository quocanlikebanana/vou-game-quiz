import { DomainEventBase } from "src/common/domain/domain-event.i";

export class QuizGameStartedDomainEvent extends DomainEventBase {
    public readonly restart: boolean = false;
    constructor(
        public readonly gameOfEventId: string,
        restart: boolean = false
    ) {
        super();
        this.restart = restart;
    }
}