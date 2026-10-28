export const PASS_SCORE = 70;

/** An empty answer or `?` skips grading. */
export const isGiveUp = (answer: string) => ["", "?"].includes(answer.trim());

export const isPass = (score: number) => score >= PASS_SCORE;
