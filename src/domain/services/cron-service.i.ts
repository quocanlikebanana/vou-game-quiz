export abstract class ICronService {
    abstract startCron(id: string, seconds: number, n: number, callback: () => void): void;
    abstract stopCron(id: string): void;
    abstract stopAll(): void;
    abstract listCrons(): string[];
}