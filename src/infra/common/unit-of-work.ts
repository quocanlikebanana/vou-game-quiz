import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { PrismaService } from "./prisma.service";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { IRepository } from "src/common/domain/repository.i";
import { QuizGameRepository } from "../repositories/quiz-game.repo";
import { IQuizGameRepository } from "src/domain/quiz-game/quiz-game.repo.i";
import { DomainEventDispatcher } from "src/common/domain/domain-event-dispatcher";
import { IUserQuizRepository } from "src/domain/user-quiz/user-quiz.repo";
import { UserQuizRepository } from "../repositories/user-quiz.repo";

@Injectable()
export class UnitOfWork implements IUnitOfWork, OnModuleDestroy {
    private readonly repositories: Map<string, IRepository<any>> = new Map();

    constructor(
        private readonly prismaService: PrismaService,
        private readonly domainEventDispatcher: DomainEventDispatcher
    ) {
        this.repositories.set(IQuizGameRepository.name, new QuizGameRepository(this.prismaService, domainEventDispatcher));
        this.repositories.set(IUserQuizRepository.name, new UserQuizRepository(this.prismaService, domainEventDispatcher));
    }

    getRepository<T, U extends IRepository<U>>(entity: abstract new (...args: any[]) => T): T {
        const repository = this.repositories.get(entity.name);
        if (!repository) {
            throw new Error(`Repository for ${entity.name} not found`);
        }
        return repository as T;
    }

    /**
     * Executes a function within a (iterative) transaction.
     */
    async executeTransaction<T>(fn: (tx: UnitOfWork) => Promise<T>): Promise<T> {
        return this.prismaService.$transaction(async (tx) => {
            const uow = new UnitOfWork(this.prismaService, this.domainEventDispatcher);
            uow.prismaService.$connect();
            return fn(uow);
        });
    }

    async onModuleDestroy() {
        await this.prismaService.$disconnect();
    }
}