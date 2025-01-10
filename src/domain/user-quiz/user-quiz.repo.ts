import { IRepository } from "src/common/domain/repository.i";
import { UserQuizAggregate, UserQuizProps } from "./user-quiz.agg";
import { UserChooseOptionValueObject } from "./user-choose-option.vo";

export abstract class IUserQuizRepository extends IRepository<UserQuizProps> {
    abstract getByUnique(userId: string, gameOfEventId: string): Promise<UserQuizAggregate>;
    abstract delete(userId: string, gameOfEventId: string): Promise<void>;
    abstract addChoosenOption(userQuiz: UserQuizAggregate, choosenOption: UserChooseOptionValueObject): Promise<void>;
}