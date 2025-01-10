import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import LoggerService from './logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(
        private readonly loggerService: LoggerService
    ) {
        super({
            log: [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'stdout',
                    level: 'error',
                },
                {
                    emit: 'stdout',
                    level: 'warn',
                },
            ],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL,
                },
            },
        });
    }

    async onModuleInit() {
        await this.$connect();
        this.$on('query' as never, (e: { query: any; params: any; duration: any; }) => {
            this.loggerService.info(`Query: ${e.query} ${e.params}`);
            this.loggerService.info(`Duration: ${e.duration}ms`);
        });
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
