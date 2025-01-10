import { ValueObject } from "src/common/domain/value-object.i";
import { DomainError } from "src/common/error/domain.error";

export interface OptionProps {
    choice: string;
    content: string;
    isCorrect: boolean;
}

export class OptionValueObject extends ValueObject<OptionProps> {
    protected validate(props: OptionProps): void {
        if (!props.choice) {
            throw new DomainError('Choice is required');
        }
        if (!props.content) {
            throw new DomainError('Content is required');
        }
    }
}