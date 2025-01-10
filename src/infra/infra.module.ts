import { Module } from '@nestjs/common';
import { PrismaService } from './common/prisma.service';
import LoggerService from './common/logger.service';
import { UnitOfWork } from './common/unit-of-work';
import { IUnitOfWork } from 'src/common/domain/unit-of-work.i';
import { CronService } from './services/cron.service';
import { ScheduleService } from './services/schedule.service';
import { ICronService } from 'src/domain/services/cron-service.i';
import { IScheduleService } from 'src/domain/services/schedule-service.t';
import { DomainEventDispatcher } from 'src/common/domain/domain-event-dispatcher';

@Module({
    providers: [
        PrismaService,
        LoggerService,
        UnitOfWork,
        {
            provide: IUnitOfWork,
            useExisting: UnitOfWork
        },
        CronService,
        {
            provide: ICronService,
            useClass: CronService
        },
        ScheduleService,
        {
            provide: IScheduleService,
            useClass: ScheduleService
        },
        DomainEventDispatcher
    ],
    exports: [
        PrismaService,
        LoggerService,
        DomainEventDispatcher,
        IUnitOfWork,
        ICronService,
        IScheduleService,
    ],
})
export class InfraModule { }
