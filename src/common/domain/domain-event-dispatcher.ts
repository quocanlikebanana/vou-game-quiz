import { Injectable } from '@nestjs/common';
import { IDomainEventHandler } from '../domain/domain-event-handler.i';
import { DomainEventBase } from '../domain/domain-event.i';

@Injectable()
export class DomainEventDispatcher {
    private handlers: { [eventName: string]: IDomainEventHandler<DomainEventBase>[] } = {};

    register<T extends DomainEventBase>(eventName: string, handler: IDomainEventHandler<T>): void {
        if (!this.handlers[eventName]) {
            this.handlers[eventName] = [];
        }
        this.handlers[eventName].push(handler);
    }

    dispatch(event: DomainEventBase): void {
        const eventName = event.constructor.name;
        const eventHandlers = this.handlers[eventName];
        if (eventHandlers && eventHandlers.length > 0) {
            eventHandlers.forEach(async (handler) => await handler.handle(event));
        }
    }
}