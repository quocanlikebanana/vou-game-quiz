import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { createLogger, format, Logger, transports } from 'winston';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class LoggerService {
    private readonly logger: Logger;

    constructor(
        private readonly configService: ConfigService
    ) {
        let logDir = this.configService.get<string>('LOG_DIR') || null;
        if (logDir == null || !fs.existsSync(logDir)) {
            logDir = path.join(__dirname, '../../../log/');
        }

        this.logger = createLogger({
            level: 'info',
            format: format.combine(
                format.timestamp(),
                format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${level}]: ${message}`;
                })
            ),
            transports: [
                new transports.File({
                    filename: 'info.log',
                    dirname: logDir,
                    level: 'info',
                }),
                new transports.File({
                    filename: 'error.log',
                    dirname: logDir,
                    level: 'error',
                })
            ]
        });
    }

    info(message: string) {
        this.logger.info(message);
    }

    error(message: string) {
        this.logger.error(message);
    }
}