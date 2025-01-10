import { DomainEventBase } from "./domain-event.i";
import { Entity } from "./entity.i";

export default abstract class AggregateRoot<T> extends Entity<T> {
    private readonly domainEvents: DomainEventBase[];

    constructor(props: T, id: string) {
        super(props, id);
        this.domainEvents = [];
    }

    protected addDomainEvent(event: DomainEventBase): void {
        this.domainEvents.push(event);
    }

    getEvents(): DomainEventBase[] {
        return this.domainEvents;
    }

    clearEvents(): void {
        this.domainEvents.splice(0, this.domainEvents.length);
    }
}