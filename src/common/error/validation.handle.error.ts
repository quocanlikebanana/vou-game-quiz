import { BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";
import { ErrorCode } from "./error.code";

export function validationExceptionFactory(validationErrors: ValidationError[] = []) {
    const extractErrors = (errors: ValidationError[], parentPath = ''): any[] => {
        return errors.flatMap(error => {
            const propertyPath = parentPath ? `${parentPath}.${error.property}` : error.property;
            const currentError = error.constraints ? {
                property: propertyPath,
                message: Object.values(error.constraints).join(', '),
            } : null;

            const nestedErrors = error.children ? extractErrors(error.children, propertyPath) : [];
            return currentError ? [currentError, ...nestedErrors] : nestedErrors;
        });
    };
    const result = extractErrors(validationErrors);
    return new BadRequestException(result, ErrorCode.INPUT_VALIDATION_FAILED);
}