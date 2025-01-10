const CORRECT_SCORE = 500;

export function evaluateScore(isCorrect: boolean, timeAnswered: number, secondPerQuestion: number): number {
    if (isCorrect) {
        return CORRECT_SCORE + (((secondPerQuestion - timeAnswered) / secondPerQuestion) * CORRECT_SCORE);
    }
    return 0;
}
