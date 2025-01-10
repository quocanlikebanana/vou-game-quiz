import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as schedule from 'node-schedule';
import { DomainError } from 'src/common/error/domain.error';
import { IScheduleService } from 'src/domain/services/schedule-service.t';
import LoggerService from '../common/logger.service';
import { PrismaService } from '../common/prisma.service';

interface ScheduledJob {
    job: schedule.Job;
    executionDate: Date;
    startedDate: Date;
}

@Injectable()
export class ScheduleService implements IScheduleService {
    private scheduledJobs: Map<string, ScheduledJob> = new Map();

    constructor(
        private readonly logger: LoggerService,
    ) { }

    scheduleDate(id: string, date: Date, callback: () => void, override = false): void {
        if (this.scheduledJobs.has(id)) {
            if (override === false) {
                this.logger.error(`A job with ID "${id}" is already scheduled.`);
                return;
            } else {
                this.cancelJob(id);
            }
        }
        const job = schedule.scheduleJob(date, () => {
            this.logger.info(`Job [${id}] triggered at ${new Date().toISOString()}`);
            callback();
            this.scheduledJobs.delete(id);
        });
        if (!job) {
            this.logger.error(`Failed to schedule job [${id}].`);
            return;
        }
        this.scheduledJobs.set(id, {
            job,
            executionDate: date,
            startedDate: new Date()
        });
        this.logger.info(`Job [${id}] scheduled for ${date}`);
    }

    scheduleInterval(id: string, interval: number, callback: () => void, override = false): void {
        const date = new Date(Date.now() + interval * 1000);
        this.scheduleDate(id, date, callback, override);
    }

    cancelJob(id: string): void {
        const scheduledJob = this.scheduledJobs.get(id);
        if (!scheduledJob) {
            this.logger.error(`No job found with ID "${id}".`);
            return;
        }
        scheduledJob.job.cancel();
        this.scheduledJobs.delete(id);
        this.logger.info(`Job [${id}] has been canceled.`);
    }

    listJobs(): string[] {
        return Array.from(this.scheduledJobs.keys());
    }

    getPassedSecond(id: string): number {
        const scheduledJob = this.scheduledJobs.get(id);
        if (!scheduledJob) {
            this.logger.error(`No job found with ID "${id}".`);
            return 0;
        }
        const now = new Date();
        const passedSecond = (now.getTime() - scheduledJob.startedDate.getTime()) / 1000;
        return passedSecond;
    }
}
