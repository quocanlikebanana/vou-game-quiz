import { Controller, Get, Query } from "@nestjs/common";
import { QuizGameInfoParam } from "src/infra/readers/quiz-game-info/quiz-game-info.param";
import { QuizGameInfoPresenter } from "src/infra/readers/quiz-game-info/quiz-game-info.presenter";
import { QuizGameInfoReader } from "src/infra/readers/quiz-game-info/quiz-game-info.reader";

@Controller()
export class QueryController {
    constructor(
        private readonly quizGameInfoReader: QuizGameInfoReader
    ) { }

    @Get('/unauth/quiz-game-info')
    async getQuizGameInfo(@Query() param: QuizGameInfoParam): Promise<QuizGameInfoPresenter> {
        return await this.quizGameInfoReader.read(param);
    }
}