import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infra/common/prisma.service';

@Injectable()
export class StatsService {
    constructor(
        private readonly prismaService: PrismaService
    ) { }

    async getUsersCountOfAll() {
        return this.prismaService.userQuiz.count();
    }

    async getUsersCountOfGame(gameOfEventId: string) {
        return this.prismaService.userQuiz.count({
            where: {
                gameOfEventId: gameOfEventId
            }
        });
    }

    async getPrizeGivenCountOfGame(gameOfEventId: string) {
        const res = await this.prismaService.userResult_Prize.groupBy({
            by: 'promotionId',
            _sum: {
                amount: true
            },
            where: {
                UserResult: {
                    UserQuiz: {
                        gameOfEventId: gameOfEventId
                    }
                }
            }
        });
        return res;
    }


}
