import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';
import LoggerService from '../common/logger.service';
import { DomainError } from 'src/common/error/domain.error';
import { ICronService } from 'src/domain/services/cron-service.i';

@Injectable()
export class CronService implements ICronService {
    constructor(
        private readonly logger: LoggerService
    ) { }
    private jobs: Map<string, CronJob> = new Map();

    /**
     * Start a new cron job
     * @param id Unique identifier for the cron job
     * @param seconds Interval in seconds for the cron job
     * @param n Total number of executions before the job stops
     * @param callback Function to execute on each trigger
     */
    startCron(id: string, seconds: number, n: number, callback: () => void) {
        if (this.jobs.has(id)) {
            throw new DomainError(`Cron job with ID "${id}" is already running.`);
        }

        let executionCount = 0;

        const job = new CronJob(
            `*/${seconds} * * * * *`, // Run every `seconds` seconds
            () => {
                executionCount++;
                this.logger.info(`Cron [${id}] executed (${executionCount}/${n})`);
                callback();
                if (executionCount >= n) {
                    this.stopCron(id);
                }
            },
            null,
            true, // Start the job automatically
        );

        this.jobs.set(id, job);
        this.logger.info(`Cron job [${id}] started with interval: ${seconds} seconds`);
    }

    /**
     * Stop a cron job by its ID
     * @param id Unique identifier for the cron job
     */
    stopCron(id: string): void {
        const job = this.jobs.get(id);
        if (!job) {
            throw new DomainError(`No cron job found with ID "${id}".`);
        }
        job.stop();
        this.jobs.delete(id);
        this.logger.info(`Cron job [${id}] stopped.`);
    }

    /**
     * Stop all running cron jobs
     */
    stopAll(): void {
        this.jobs.forEach((job, id) => {
            this.stopCron(id);
        });
        this.jobs.clear();
    }

    /**
     * List all active cron jobs
     */
    listCrons(): string[] {
        return Array.from(this.jobs.keys());
    }
}
