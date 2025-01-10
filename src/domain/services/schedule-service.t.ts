export abstract class IScheduleService {
    abstract scheduleDate(id: string, date: Date, callback: () => void, override: boolean): void;
    abstract scheduleInterval(id: string, interval: number, callback: () => void, override: boolean): void;
    abstract cancelJob(id: string): void;
    abstract listJobs(): string[];
    abstract getPassedSecond(id: string): number;
}