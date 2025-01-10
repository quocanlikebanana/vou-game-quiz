import { IsString } from "class-validator";

export class SubmitAnswerParam {
    @IsString()
    questionId: string;

    @IsString()
    choice: string;

    @IsString()
    gameOfEventId: string;

    @IsString()
    userId: string;
} 