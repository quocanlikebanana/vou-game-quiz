import { ValueObject } from "src/common/domain/value-object.i";

export interface UserChooseOptionProps {
    choice: string;
    questionId: string;
    userQuizId: string;
    timeAnswered: number;
}

export class UserChooseOptionValueObject extends ValueObject<UserChooseOptionProps> {
    protected validate(props: UserChooseOptionProps): void {
        if (props.timeAnswered <= 0) {
            throw new Error('Time answered must be greater than 0');
        }
    }
}