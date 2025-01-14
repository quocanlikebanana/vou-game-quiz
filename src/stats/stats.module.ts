import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { InfraModule } from 'src/infra/infra.module';

@Module({
  imports: [InfraModule],
  controllers: [StatsController],
  providers: [StatsService]
})
export class StatsModule { }
