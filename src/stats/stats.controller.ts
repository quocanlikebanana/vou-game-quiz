import { Controller } from '@nestjs/common';
import { StatsService } from './stats.service';
import { Get, Param } from '@nestjs/common';

@Controller('/unauth/stats')
export class StatsController {
    constructor(
        private readonly statsService: StatsService
    ) { }

    @Get('users-count')
    async getUsersCountOfAll() {
        return this.statsService.getUsersCountOfAll();
    }

    @Get('users-count/:gameOfEventId')
    async getUsersCountOfGame(@Param('gameOfEventId') gameOfEventId: string) {
        return this.statsService.getUsersCountOfGame(gameOfEventId);
    }

    @Get('prize-given-count/:gameOfEventId')
    async getPrizeGivenCountOfGame(@Param('gameOfEventId') gameOfEventId: string) {
        return this.statsService.getPrizeGivenCountOfGame(gameOfEventId);
    }
}
