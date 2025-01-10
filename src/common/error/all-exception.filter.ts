import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { DomainError } from "src/common/error/domain.error";

Catch()
export class CatchEverythingFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        console.log('[EXCEPTION TYPE]', typeof exception);
        console.log('[EXCEPTION CONTENT]', exception);

        // In certain situations `httpAdapter` might not be available in the constructor method, thus we should resolve it here.
        const { httpAdapter } = this.httpAdapterHost;

        const ctx = host.switchToHttp();

        let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let responseBody: any = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
        };

        if (exception instanceof HttpException) {
            httpStatus = exception.getStatus();
            responseBody = {
                ...responseBody,
                statusCode: httpStatus,
                message: exception.message,
                response: exception.getResponse()
            };
        } else if (exception instanceof PrismaClientKnownRequestError) {
            httpStatus = HttpStatus.BAD_REQUEST;
            responseBody = {
                ...responseBody,
                statusCode: httpStatus,
                message: "Constraint violation",
                errorMessage: exception.message,
                code: exception.code,
                meta: exception.meta,
            };
        } else if (exception instanceof DomainError) {
            httpStatus = HttpStatus.BAD_REQUEST;
            responseBody = {
                ...responseBody,
                statusCode: httpStatus,
                message: exception.message,
            };
        } else {
            responseBody = {
                ...responseBody,
                message: 'Internal server error (Unknown exception)',
                error: exception,
            }
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}