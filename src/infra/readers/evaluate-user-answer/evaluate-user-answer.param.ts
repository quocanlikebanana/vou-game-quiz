import { IsString } from "class-validator";

export class EvaluateUserAnswerParam {
    @IsString()
    userId: string;

    @IsString()
    gameOfEventId: string;
}