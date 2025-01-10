import IReader from "src/common/app/reader.i";
import { PrismaService } from "src/infra/common/prisma.service";
import { TopUsersPresenter } from "./top-users.presenter";
import { TopUsersParam } from "./top-users.param";
import { Injectable } from "@nestjs/common";

@Injectable()
export class TopUsersReader implements IReader<TopUsersParam, TopUsersPresenter> {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async read(param: TopUsersParam): Promise<TopUsersPresenter> {
        const res = await this.prismaService.userQuiz.findMany({
            where: {
                gameOfEventId: param.gameOfEventId
            },
            include: {
                UserResult: {
                    take: 1,
                    orderBy: {
                        score: 'desc'
                    },
                    select: {
                        score: true,
                        top: true
                    }
                }
            },
            take: param.perPage,
            skip: param.perPage * (param.page - 1)
        });
        const total = await this.prismaService.userQuiz.count({
            where: {
                gameOfEventId: param.gameOfEventId
            }
        });
        return {
            data: res.map(r => ({
                userId: r.userId,
                gameOfEventId: r.gameOfEventId,
                score: r.UserResult.length > 0 ? r.UserResult[0].score : null,
                top: r.UserResult.length > 0 ? r.UserResult[0].top : null
            })),
            totalUser: total,
            page: param.page,
            perPage: param.perPage,
        };
    }
}