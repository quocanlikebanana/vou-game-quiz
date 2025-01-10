import ICommand from "src/common/app/command.i";
import { SubmitAnswerParam } from "./submit-answer.param";
import { IUnitOfWork } from "src/common/domain/unit-of-work.i";
import { IUserQuizRepository } from "src/domain/user-quiz/user-quiz.repo";
import { UserChooseOptionValueObject } from "src/domain/user-quiz/user-choose-option.vo";
import { IScheduleService } from "src/domain/services/schedule-service.t";
import { Injectable } from "@nestjs/common";
import { DomainError } from "src/common/error/domain.error";

@Injectable()
export class SubmitAnswerCommand implements ICommand<SubmitAnswerParam> {
    constructor(
        private readonly unitOfWork: IUnitOfWork,
        private readonly scheduleService: IScheduleService
    ) { }

    async execute(param: SubmitAnswerParam): Promise<void> {
        const { questionId, choice, gameOfEventId, userId } = param;
        const userQuizRepository = this.unitOfWork.getRepository(IUserQuizRepository);
        const userQuiz = await userQuizRepository.getByUnique(userId, gameOfEventId);
        if (!userQuiz) {
            throw new DomainError(`User quiz not found`);
        }
        const userQuizId = userQuiz.id;
        const passedSecond = this.scheduleService.getPassedSecond(gameOfEventId);
        const option = new UserChooseOptionValueObject({
            choice,
            questionId,
            userQuizId,
            timeAnswered: passedSecond
        });
        userQuiz.addOptionChoosen(option);
        await userQuizRepository.addChoosenOption(userQuiz, option);
    }
}