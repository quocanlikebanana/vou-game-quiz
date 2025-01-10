import { IsString } from "class-validator";

export class JoinQuizParam {
    @IsString()
    gameOfEventId: string;

    @IsString()
    userId: string;
}