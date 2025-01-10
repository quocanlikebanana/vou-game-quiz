import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import LoggerService from 'src/infra/common/logger.service';

@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
    constructor(
        private readonly logger: LoggerService
    ) { }

    use(req: Request, res: Response, next: NextFunction): void {
        const { method, originalUrl } = req;
        const start = Date.now();

        res.on('finish', () => {
            const { statusCode } = res;
            const duration = Date.now() - start;
            this.logger.info(`${method} ${originalUrl} ${statusCode} ${duration}ms`);
            req.params && this.logger.info(`Params: ${JSON.stringify(req.params)}`);
            req.query && this.logger.info(`Query: ${JSON.stringify(req.query)}`);
            if (req.method === 'POST') {
                this.logger.info(`Body: ${JSON.stringify(req.body)}`);
            }
        });

        next();
    }
}