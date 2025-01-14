import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfraModule } from './infra/infra.module';
import { QueryController } from './controllers/query.controller';
import { QuizGameController } from './controllers/quiz-game.controller';
import { DomainEventDispatcher } from './common/domain/domain-event-dispatcher';
import { CreateQuizCommand } from './commands/quiz-game/create-quiz/create-quiz.command';
import { DeleteQuizCommand } from './commands/quiz-game/delete-quiz/delete-quiz.command';
import { NextQuizCommand } from './commands/quiz-game/next-quiz/next-quiz.command';
import { StartQuizCommand } from './commands/quiz-game/start-quiz/start-quiz.command';
import { JoinQuizCommand } from './commands/user-quiz/join-quiz/join-quiz.command';
import { SubmitAnswerCommand } from './commands/user-quiz/submit-answer/submit-answer.command';
import { QuizGameCreatedDomainEventHandler } from './commands/handlers/quiz-game/quiz-game-created.deh';
import { QuizGameEndedDomainEventHandler } from './commands/handlers/quiz-game/quiz-game-ended.deh';
import { QuizGameNextedDomainEventHandler } from './commands/handlers/quiz-game/quiz-game-nexted.deh';
import { QuizGameStartedDomainEventHandler } from './commands/handlers/quiz-game/quiz-game-started.deh';
import { GetUserResultReader } from './infra/readers/get-user-result/get-user-result.reader';
import { QuestionDisplayReader } from './infra/readers/question-display/question-display.reader';
import { QuizGameInfoReader } from './infra/readers/quiz-game-info/quiz-game-info.reader';
import { TopUsersReader } from './infra/readers/top-users/top-users.reader';
import { QuizGameCreatedDomainEvent } from './domain/quiz-game/domain-events/quiz-game-created.de';
import { QuizGameEndedDomainEvent } from './domain/quiz-game/domain-events/quiz-game-ended.de';
import { QuizGameNextedDomainEvent } from './domain/quiz-game/domain-events/quiz-game-nexted.de';
import { QuizGameStartedDomainEvent } from './domain/quiz-game/domain-events/quiz-game-started.de';
import { QuizGateway } from './socket/quiz.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EvaluateUserAnswerReader } from './infra/readers/evaluate-user-answer/evaluate-user-answer.reader';
import { HttpModule } from '@nestjs/axios';
import { StatsModule } from './stats/stats.module';
import { IQuizGameRepository } from './domain/quiz-game/quiz-game.repo.i';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    InfraModule,
    HttpModule,
    StatsModule,
  ],
  providers: [
    // Handlers

    QuizGameCreatedDomainEventHandler,
    QuizGameEndedDomainEventHandler,
    QuizGameNextedDomainEventHandler,
    QuizGameStartedDomainEventHandler,

    // Commands

    CreateQuizCommand,
    DeleteQuizCommand,
    NextQuizCommand,
    StartQuizCommand,

    JoinQuizCommand,
    SubmitAnswerCommand,

    // Readers

    GetUserResultReader,
    QuestionDisplayReader,
    QuizGameInfoReader,
    TopUsersReader,
    EvaluateUserAnswerReader,

    // Gateways

    QuizGateway,
  ],
  controllers: [
    QueryController,
    QuizGameController,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly domainEventDispatcher: DomainEventDispatcher,
    private readonly quizGameCreatedDomainEventHandler: QuizGameCreatedDomainEventHandler,
    private readonly quizGameEndedDomainEventHandler: QuizGameEndedDomainEventHandler,
    private readonly quizGameNextedDomainEventHandler: QuizGameNextedDomainEventHandler,
    private readonly quizGameStartedDomainEventHandler: QuizGameStartedDomainEventHandler,
  ) { }

  onModuleInit() {
    this.domainEventDispatcher.register(
      QuizGameCreatedDomainEvent.name,
      this.quizGameCreatedDomainEventHandler
    );
    this.domainEventDispatcher.register(
      QuizGameEndedDomainEvent.name,
      this.quizGameEndedDomainEventHandler
    );
    this.domainEventDispatcher.register(
      QuizGameNextedDomainEvent.name,
      this.quizGameNextedDomainEventHandler
    );
    this.domainEventDispatcher.register(
      QuizGameStartedDomainEvent.name,
      this.quizGameStartedDomainEventHandler
    );
  }
}
