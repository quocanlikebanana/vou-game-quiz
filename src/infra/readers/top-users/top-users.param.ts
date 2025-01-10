import { IsNumber, IsString } from "class-validator";

export class TopUsersParam {
    @IsString()
    gameOfEventId: string;

    @IsNumber()
    page: number;

    @IsNumber()
    perPage: number;
}