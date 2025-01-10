import { DomainEventBase } from "./domain-event.i";

export abstract class IDomainEventHandler<T extends DomainEventBase> {
    abstract handle(event: T): Promise<void>;
}