import { Entity } from "src/common/domain/entity.i";
import { PrizeValueObject } from "./prize.vo";
import { DomainError } from "src/common/error/domain.error";
import { generateUUID } from "src/common/utils/generator";

export type PrizeCreateDTO = {
    promotionId: string;
    amount: number;
}

export type QuizThresholdCreateDTO = {
    threshold: number;
    metric: Metric;
    prizes: PrizeCreateDTO[];
}

export enum Metric {
    SCORE = 'Score',
    TOP = 'Top'
}

export interface QuizThresholdProps {
    threshold: number;
    metric: Metric;
    prizes: PrizeValueObject[];
}

export class QuizThresholdEntity extends Entity<QuizThresholdProps> {
    public manualValidate(): void {
        if (this.props.threshold < 0) {
            throw new DomainError("Threshold must be greater than 0");
        }
    }

    public static create(dto: QuizThresholdCreateDTO): QuizThresholdEntity {
        const prizes = dto.prizes.map(prize => new PrizeValueObject(prize));
        const id = generateUUID();
        const threshold = new QuizThresholdEntity({
            threshold: dto.threshold,
            metric: dto.metric,
            prizes: prizes
        }, id);
        threshold.manualValidate();
        return threshold;
    }

    public exchange(threshold: number): PrizeValueObject[] {
        if (this.props.metric === Metric.SCORE) {
            if (threshold >= this.props.threshold) {
                return this.props.prizes;
            }
            return [];
        }
        if (this.props.metric === Metric.TOP) {
            if (threshold <= this.props.threshold) {
                return this.props.prizes;
            }
            return [];
        }
        throw new DomainError("Invalid metric");
    }
}