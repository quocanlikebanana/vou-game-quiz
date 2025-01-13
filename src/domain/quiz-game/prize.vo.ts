import { ValueObject } from "src/common/domain/value-object.i";

export interface PrizeProps {
    promotionId: number;
    amount: number;
}

export class PrizeValueObject extends ValueObject<PrizeProps> {
    protected validate(props: PrizeProps): void {
        if (props.amount < 0) {
            throw new Error("Prize amount must be greater than 0");
        }
    }
}