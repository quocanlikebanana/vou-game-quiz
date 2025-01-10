import { IRepository } from "./repository.i";

export abstract class IUnitOfWork {
    abstract getRepository<T, U extends IRepository<U>>(entity: abstract new (...args: any[]) => T): T;

    /**
     * Executes a function within a (iterative) transaction.
     * NOTE: Do note open the "gate" for too long, for example: send emails, notifications, .... (That's why it is called in each execute method, not at an common abstract method)
     */
    abstract executeTransaction<T>(fn: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
}