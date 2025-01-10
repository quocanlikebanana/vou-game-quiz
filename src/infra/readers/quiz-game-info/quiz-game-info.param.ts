import { IsString } from "class-validator";

export class QuizGameInfoParam {
    @IsString()
    gameOfEventId: string;
}