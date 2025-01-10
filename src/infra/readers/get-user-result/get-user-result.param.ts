import { IsString } from "class-validator";

export class GetUserResultParam {
    @IsString()
    userId: string;

    @IsString()
    gameOfEventId: string;
}