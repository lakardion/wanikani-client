/** PROTOTYPE: generation and grading prompts, schemas, and the server-side constraint check. */
import { openrouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod";
import type { Grammar } from "./grammar";

export const PASS_SCORE = 70;

type Word = { characters: string; meaning: string };

export const exerciseSchema = z.object({
  japanese: z.string(),
  reading: z.string(),
  english: z.string(),
  breakdown: z.array(z.object({ text: z.string(), reading: z.string(), meaning: z.string() })),
  grammarExplanation: z.string(),
  example: z.object({ japanese: z.string(), english: z.string() }),
});
export type Exercise = z.infer<typeof exerciseSchema>;

export const gradeSchema = z.object({
  score: z.number().int().min(0).max(100),
  feedback: z.string(),
});

const GENERATE_SYSTEM = `You write one short Japanese practice sentence for an English-speaking learner of Japanese.

Rules:
1. Grammar: the sentence must use the TARGET GRAMMAR naturally and correctly. It is the point of the exercise.
2. Kanji: use ONLY kanji that appear in ALLOWED KANJI. Write every other word in hiragana, or katakana for loanwords. Never use a kanji outside the list, even in very common words.
3. Vocabulary: take the content words (nouns, verbs, adjectives, adverbs) from WORD LIST. Pick only the few words that fit one natural situation; ignore the rest. Particles, auxiliaries, conjugated endings, pronouns, counters, and the words of the target grammar itself are always allowed.
4. Length: one sentence of 10 to 30 Japanese characters.
5. Realism: natural everyday Japanese that a native speaker would say, in a plausible real-world situation. No nonsense combinations.

Fields:
- japanese: the sentence.
- reading: the whole sentence in hiragana.
- english: one natural English translation.
- breakdown: the sentence split into words and particles, in order. For each: text as written, reading in hiragana, short English meaning or grammatical role.
- grammarExplanation: 2 to 4 short English sentences for a learner. Explain what the target grammar means, how it is formed, and how it works in this sentence.
- example: one more short sentence that uses the same target grammar, with its English translation. Follow the same kanji and vocabulary rules.`;

const GRADE_SYSTEM = `You grade a learner's English translation of a Japanese sentence.

Score 0 to 100 for MEANING only. Ignore English spelling, grammar, punctuation, capitalisation, and word choice when the meaning is the same. The reference is one valid translation, not the only one; judge against the Japanese.

Rubric:
- 90-100: same meaning; only phrasing differs.
- 70-89: core meaning right; one minor detail off (a modifier, a nuance of politeness, singular/plural, a small omitted word).
- 40-69: one key element wrong: tense, negation, who does what to whom, the meaning of the target grammar, or a key content word.
- 0-39: mostly wrong, unrelated, or empty.

feedback: one or two short English sentences. At 90 or more, confirm briefly. Below 90, name the specific part that is off (which word or which meaning). Never write out the full correct translation.`;

/** OpenRouter model IDs, comma-separated in `OPENROUTER_MODELS`. The first is the default; the eval compares all. */
export const MODELS = (process.env.OPENROUTER_MODELS ?? "nvidia/nemotron-3.5-super-vl:free,xingchen-agi/xing4.0-29b-a4b:free").split(",");

/** ponytail: one call every 3.1 s keeps free models under 20 req/min; paid models skip it. */
let gate = Promise.resolve();
const throttle = (model: string) =>
  model.endsWith(":free") ? (gate = gate.then(() => new Promise((r) => setTimeout(r, 3100)))) : Promise.resolve();

/** Models that reason by default and accept `effort: "none"`. Mistral does not reason by default; Gemini 3.5 rejects `"none"`. */
const REASONING_OFF = ["openai/", "anthropic/", "deepseek/", "google/gemini-3.1"];

const llm = (model: string) =>
  openrouter(model, {
    provider: { require_parameters: true, sort: "price" },
    plugins: [{ id: "response-healing" }],
    usage: { include: true },
    ...(REASONING_OFF.some((p) => model.startsWith(p)) && { reasoning: { effort: "none" as const } }),
  });

/** Real cost in USD and the endpoint OpenRouter routed to. */
const billing = (meta: any) => ({ cost: meta?.openrouter?.usage?.cost as number | undefined, provider: meta?.openrouter?.provider as string | undefined });

const KANJI_RE = /[㐀-䶿一-鿿]/g;

/** Kanji in `text` that are not in `allowed`. The only constraint the server enforces. */
export const kanjiViolations = (text: string, allowed: string) =>
  [...new Set(text.match(KANJI_RE) ?? [])].filter((k) => !allowed.includes(k));

export async function generateExercise(input: {
  sample: Word[];
  kanji: string;
  grammar: Grammar;
  model?: string;
}) {
  const model = input.model ?? MODELS[0]!;
  const prompt = [
    `TARGET GRAMMAR: ${input.grammar.pattern} — ${input.grammar.meaning} (JLPT ${input.grammar.level})`,
    `ALLOWED KANJI: ${input.kanji}`,
    `WORD LIST:\n${input.sample.map((w) => `${w.characters} = ${w.meaning}`).join("\n")}`,
  ].join("\n\n");
  await throttle(model);
  const t0 = performance.now();
  const res = await generateText({
    model: llm(model),
    system: GENERATE_SYSTEM,
    prompt,
    output: Output.object({ schema: exerciseSchema }),
  });
  const exercise = res.output;
  return {
    model,
    grammar: input.grammar.id,
    exercise,
    violations: kanjiViolations(exercise.japanese + exercise.example.japanese, input.kanji),
    ms: Math.round(performance.now() - t0),
    usage: res.usage,
    ...billing(res.providerMetadata),
  };
}

export async function gradeAnswer(input: {
  exercise: Pick<Exercise, "japanese" | "english">;
  grammar: Pick<Grammar, "pattern" | "meaning">;
  answer: string;
  model?: string;
}) {
  const model = input.model ?? MODELS[0]!;
  const prompt = [
    `JAPANESE: ${input.exercise.japanese}`,
    `REFERENCE TRANSLATION: ${input.exercise.english}`,
    `TARGET GRAMMAR: ${input.grammar.pattern} — ${input.grammar.meaning}`,
    `LEARNER ANSWER: ${input.answer}`,
  ].join("\n");
  await throttle(model);
  const t0 = performance.now();
  const res = await generateText({
    model: llm(model),
    system: GRADE_SYSTEM,
    prompt,
    output: Output.object({ schema: gradeSchema }),
  });
  return { ...res.output, pass: res.output.score >= PASS_SCORE, ms: Math.round(performance.now() - t0), usage: res.usage, ...billing(res.providerMetadata) };
}
