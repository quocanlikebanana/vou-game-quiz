import AggregateRoot from "src/common/domain/aggregate.i";
import { QuestionEntity } from "./question.entity";
import { Metric, QuizThresholdEntity } from "./quiz-threshold.entity";
import { PrizeValueObject } from "./prize.vo";
import { DomainError } from "src/common/error/domain.error";
import { QuizGameCreatedDomainEvent } from "./domain-events/quiz-game-created.de";
import { QuizGameStartedDomainEvent } from "./domain-events/quiz-game-started.de";
import { QuizGameNextedDomainEvent } from "./domain-events/quiz-game-nexted.de";
import { QuizGameEndedDomainEvent } from "./domain-events/quiz-game-ended.de";

const NOT_STARTED_QUESTION_INDEX = -1;

export enum QuizGameState {
    NOTSTARTED = "NotStarted",
    STARTED = "Started",
    ENDED = "Ended",
}

export interface QuizGameProps {
    questions: QuestionEntity[];
    quizThresholds: QuizThresholdEntity[];
    startTime: Date;
    state: QuizGameState;
    questionIndex: number;
    secondPerQuestion: number;
}

export class QuizGameAggregate extends AggregateRoot<QuizGameProps> {
    public manualValidate(): void {
        if (this.props.questions.length === 0) {
            throw new Error("Quiz must have at least one question");
        }
        if (this.props.quizThresholds.length === 0) {
            throw new Error("Quiz must have at least one threshold");
        }
    }

    public static create(gameOfEventId: string, questions: QuestionEntity[], quizThreshold: QuizThresholdEntity[], startTime: Date, secondPerQuestion: number): QuizGameAggregate {
        const quizGame = new QuizGameAggregate({
            questions,
            quizThresholds: quizThreshold,
            startTime,
            state: QuizGameState.NOTSTARTED,
            questionIndex: NOT_STARTED_QUESTION_INDEX,
            secondPerQuestion,
        }, gameOfEventId);
        quizGame.manualValidate();
        quizGame.addDomainEvent(new QuizGameCreatedDomainEvent(gameOfEventId, startTime));
        return quizGame;
    }


    // Test method
    public reset(): void {
        this.props.questionIndex = NOT_STARTED_QUESTION_INDEX;
        this.props.state = QuizGameState.NOTSTARTED;
    }

    public checkAnswer(choice: string): boolean {
        if (this.props.questionIndex === NOT_STARTED_QUESTION_INDEX || this.props.questionIndex >= this.props.questions.length) {
            throw new DomainError("Quiz has not started yet or has ended");
        }
        const question = this.props.questions[this.props.questionIndex];
        if (!question) {
            throw new DomainError("Question not found");
        }
        return question.checkAnswer(choice);
    }

    public start(): void {
        if (this.props.state !== QuizGameState.NOTSTARTED) {
            throw new DomainError("Quiz has already started");
        }
        this.props.state = QuizGameState.STARTED;
        this.addDomainEvent(new QuizGameStartedDomainEvent(this.id));
    }

    public nextQuestion(): void {
        if (this.props.state === QuizGameState.NOTSTARTED) {
            throw new DomainError("Quiz has not started yet");
        }
        if (this.props.state === QuizGameState.ENDED) {
            throw new DomainError("Quiz has ended");
        }
        this.props.questionIndex++;
        console.log("questionIndex", this.props.questionIndex);
        if (this.props.questionIndex === this.props.questions.length) {
            this.props.state = QuizGameState.ENDED;
            this.addDomainEvent(new QuizGameEndedDomainEvent(this.id, this.props.secondPerQuestion, this.props.questionIndex));
        } else {
            this.addDomainEvent(new QuizGameNextedDomainEvent(this.id, this.props.secondPerQuestion, this.props.questionIndex));
        }
    }

    public evaluate(threshold: number, metric: Metric, accumulate: boolean = false): PrizeValueObject[] {
        const metricThreshold = this.props.quizThresholds.filter(quizThreshold => quizThreshold.props.metric === metric);

        if (accumulate === true) {
            return metricThreshold.filter(quizThreshold => quizThreshold.props.threshold <= threshold)
                .map(quizThreshold => quizThreshold.props.prizes)
                .reduce((acc, prize) => acc.concat(prize), []);
        }
        else {
            if (metric === Metric.SCORE) {
                const filteredThreshold = metricThreshold.filter(quizThreshold => quizThreshold.props.threshold <= threshold);
                const maxThreshold = filteredThreshold.reduce((max, quizThreshold) => quizThreshold.props.threshold > max.props.threshold ? quizThreshold : max, filteredThreshold[0]);
                return maxThreshold.props.prizes;
            }
            if (metric === Metric.TOP) {
                const filteredThreshold = metricThreshold.filter(quizThreshold => quizThreshold.props.threshold >= threshold);
                const minThreshold = filteredThreshold.reduce((min, quizThreshold) => quizThreshold.props.threshold < min.props.threshold ? quizThreshold : min, filteredThreshold[0]);
                return minThreshold.props.prizes;
            }
        }
    }
}