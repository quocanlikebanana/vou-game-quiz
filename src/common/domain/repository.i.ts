import { Injectable } from "@nestjs/common";
import AggregateRoot from "./aggregate.i";
import { DomainEventDispatcher } from "./domain-event-dispatcher";

@Injectable()
export abstract class IRepository<T> {
    constructor(
        private readonly domainEventDispatcher: DomainEventDispatcher
    ) { }
    async save(agg: AggregateRoot<T>): Promise<void> {
        await this._save(agg);
        while (agg.getEvents().length > 0) {
            this.domainEventDispatcher.dispatch(agg.getEvents().pop());
        }
    }
    protected abstract _save(agg: AggregateRoot<T>): Promise<void>;
}