import AggregateRoot from "src/common/domain/aggregate.i";
import { UserChooseOptionValueObject } from "./user-choose-option.vo";
import { DomainError } from "src/common/error/domain.error";
import { generateUUID } from "src/common/utils/generator";

export interface UserQuizProps {
    userId: string;
    gameOfEventId: string;
    userChooseOptions: UserChooseOptionValueObject[];
}

export class UserQuizAggregate extends AggregateRoot<UserQuizProps> {
    public manualValidate(): void { }

    public static create(userId: string, gameOfEventId: string): UserQuizAggregate {
        const id = generateUUID();
        const userQuiz = new UserQuizAggregate({
            userId,
            gameOfEventId,
            userChooseOptions: [],
        }, id);
        return userQuiz;
    }

    public addOptionChoosen(option: UserChooseOptionValueObject): void {
        const index = this.props.userChooseOptions.findIndex(co => co.props.questionId === option.props.questionId);
        if (index !== -1) {
            this.props.userChooseOptions[index] = option;
        } else {
            this.props.userChooseOptions.push(option);
        }
    }
}