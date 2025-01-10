import { IsString } from "class-validator";

export class QuestionDisplayParam {
    @IsString()
    gameOfEventId: string;
}