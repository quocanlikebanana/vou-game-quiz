import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsString, ValidateNested } from "class-validator";
import { Metric } from "src/domain/quiz-game/quiz-threshold.entity";

class OptionCreateDTO {
    @IsString()
    choice: string;

    @IsString()
    content: string;

    @IsBoolean()
    isCorrect: boolean;
}

class QuestionCreateDTO {
    @IsString()
    content: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OptionCreateDTO)
    options: OptionCreateDTO[];
}

class PrizeCreateDTO {
    @IsString()
    promotionId: string;

    @IsNumber()
    amount: number;
}

class QuizThresholdCreateDTO {
    @IsNumber()
    threshold: number;

    @IsEnum(Metric)
    metric: Metric;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PrizeCreateDTO)
    prizes: PrizeCreateDTO[];
}

export class CreateQuizParam {
    @IsString()
    gameOfEventId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionCreateDTO)
    questions: QuestionCreateDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuizThresholdCreateDTO)
    quizThresholds: QuizThresholdCreateDTO[];

    @IsNumber()
    secondPerQuestion: number;

    @IsDateString()
    startTime: Date;
}