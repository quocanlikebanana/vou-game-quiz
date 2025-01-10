export class EvaluateUserAnswerPresenter {
    constructor(
        public readonly questionId: string,
        public readonly isCorrect: boolean,
        public readonly isAnswered: boolean,
        public readonly score: number,
    ) { }
}