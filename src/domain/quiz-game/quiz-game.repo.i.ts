import { IRepository } from "src/common/domain/repository.i";
import { QuizGameAggregate, QuizGameProps } from "./quiz-game.agg";

export abstract class IQuizGameRepository extends IRepository<QuizGameProps> {
    abstract getById(id: string): Promise<QuizGameAggregate>;
    abstract delete(id: string): Promise<void>;
}