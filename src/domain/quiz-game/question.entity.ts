import { Entity } from "src/common/domain/entity.i";
import { OptionValueObject } from "./option.vo";
import { DomainError } from "src/common/error/domain.error";
import { generateUUID } from "src/common/utils/generator";

export type OptionCreateDTO = {
    choice: string;
    content: string;
    isCorrect: boolean;
}

export type QuestionCreateDTO = {
    content: string;
    options: OptionCreateDTO[];
}

export interface QuestionProps {
    content: string;
    options: OptionValueObject[];
}

export class QuestionEntity extends Entity<QuestionProps> {
    public manualValidate(): void {
        if (!this.props.content) {
            throw new DomainError('Content is required');
        }
        if (!this.props.options || this.props.options.length === 0) {
            throw new DomainError('Options is required');
        }
    }

    public static create(dto: QuestionCreateDTO): QuestionEntity {
        const options = dto.options.map(option => new OptionValueObject(option));
        const id = generateUUID();
        const question = new QuestionEntity({
            content: dto.content,
            options
        }, id);
        question.manualValidate();
        return question;
    }

    public checkAnswer(answer: string): boolean {
        const option = this.props.options.find(option => option.props.choice === answer);
        if (!option) {
            throw new DomainError('Option not found');
        }
        return option.props.isCorrect;
    }

    public shuffleOptions(): void {
        this.props.options = this.props.options.sort(() => Math.random() - 0.5);
    }
}