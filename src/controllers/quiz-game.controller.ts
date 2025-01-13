import { Body, Controller, Post } from "@nestjs/common";
import { CreateQuizCommand } from "src/commands/quiz-game/create-quiz/create-quiz.command";
import { CreateQuizParam } from "src/commands/quiz-game/create-quiz/create-quiz.param";
import { DeleteQuizCommand } from "src/commands/quiz-game/delete-quiz/delete-quiz.command";
import { NextQuizCommand } from "src/commands/quiz-game/next-quiz/next-quiz.command";
import { StartQuizCommand } from "src/commands/quiz-game/start-quiz/start-quiz.command";
import { DomainEventDispatcher } from "src/common/domain/domain-event-dispatcher";
import { QuizGameStartedDomainEvent } from "src/domain/quiz-game/domain-events/quiz-game-started.de";

@Controller("quiz-game")
export class QuizGameController {
    constructor(
        private readonly createQuizCommand: CreateQuizCommand,
        private readonly deleteQuizCommand: DeleteQuizCommand,
        private readonly nextQuizCommand: NextQuizCommand,
        private readonly startQuizCommand: StartQuizCommand,
        private readonly domainEventDispatcher: DomainEventDispatcher
    ) { }

    @Post('/partner/create')
    async createQuiz(@Body() createQuizParam: CreateQuizParam): Promise<void> {
        return await this.createQuizCommand.execute(createQuizParam);
    }

    @Post('/partner/delete')
    async deleteQuiz(@Body() deleteQuizParam: { gameOfEventId: string }): Promise<void> {
        return await this.deleteQuizCommand.execute(deleteQuizParam);
    }

    @Post('/partner/start')
    async startQuiz(@Body() startQuizParam: { gameOfEventId: string }): Promise<void> {
        try {
            return await this.startQuizCommand.execute(startQuizParam);
        } catch (error) {
            this.domainEventDispatcher.dispatch(new QuizGameStartedDomainEvent(startQuizParam.gameOfEventId, true));
        }
    }
}