import IReader from "src/common/app/reader.i";
import { GetUserResultParam } from "./get-user-result.param";
import { GetUserResultPresenter } from "./get-user-result.presenter";
import { PrismaService } from "src/infra/common/prisma.service";
import { Injectable } from "@nestjs/common";
import { DomainError } from "src/common/error/domain.error";

@Injectable()
export class GetUserResultReader implements IReader<GetUserResultParam, GetUserResultPresenter> {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async read(param: GetUserResultParam): Promise<GetUserResultPresenter> {
        const resUserQuiz = await this.prismaService.userQuiz.findUnique({
            where: {
                userId_gameOfEventId: {
                    userId: param.userId,
                    gameOfEventId: param.gameOfEventId
                }
            }
        });
        if (resUserQuiz == null) {
            throw new DomainError("User quiz not found");
        }
        const res = await this.prismaService.userResult.findMany({
            where: {
                userQuizId: resUserQuiz.id
            },
            orderBy: {
                score: 'desc'
            },
            take: 1,
        });
        if (res == null) {
            throw new DomainError("User result not found for this user quiz");
        }
        return {
            score: res.length > 0 ? res[0].score : null,
            top: res.length > 0 ? res[0].top : null,
        };
    }
}