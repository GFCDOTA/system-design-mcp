export interface QuizOption {
  id: string;
  label: string;
}
export interface ChoiceQuestion {
  type: "identify" | "worsen" | "signal";
  fmId: string;
  prompt: string;
  options: QuizOption[];
  answer: string;
  explanation: string;
}
export interface OpenQuestion {
  type: "open";
  fmId: string;
  prompt: string;
  answer: string;
  explanation: string;
}
export type QuizQuestion = ChoiceQuestion | OpenQuestion;
export interface ChainGame {
  type: "chain";
  fmId: string;
  prompt: string;
  steps: string[];
  answer: string[];
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fm = any;
export declare function rng(seed: number): () => number;
export declare function shuffle<T>(list: T[], random: () => number): T[];
export declare function identifyQuestion(fm: Fm, all: Fm[], random: () => number): ChoiceQuestion;
export declare function worsenQuestion(fm: Fm, random: () => number): ChoiceQuestion;
export declare function signalQuestion(fm: Fm, all: Fm[], random: () => number): ChoiceQuestion;
export declare function openQuestion(fm: Fm): OpenQuestion;
export declare function chainGame(fm: Fm, random: () => number): ChainGame;
export declare function isCorrectOrder(game: ChainGame, attempt: string[]): boolean;
export declare function buildQuiz(
  fms: Fm[],
  opts?: { seed?: number; count?: number; types?: Array<"identify" | "worsen" | "signal" | "open"> },
): QuizQuestion[];
