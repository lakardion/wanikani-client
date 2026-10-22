'use server'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { APICallError, generateText, Output } from 'ai'
import { z } from 'zod'
import { GRAMMAR } from '~/lib/grammar'
import { kanjiViolations } from '~/lib/kanji'

const DAILY_LLM_CALL_CAP = 300
const DEFAULT_MODEL = 'nvidia/nemotron-3.5-super-vl:free'

const GENERATE_SYSTEM = `You write one short Japanese practice sentence for an English-speaking learner of Japanese.

Rules:
1. Grammar: the sentence must use the TARGET GRAMMAR naturally and correctly. It is the point of the exercise.
2. Kanji: use ONLY kanji that appear in ALLOWED KANJI. Write every other word in hiragana, or katakana for loanwords. Never use a kanji outside the list, even in very common words.
3. Vocabulary: take the content words (nouns, verbs, adjectives, adverbs) from WORD LIST. Pick only the few words that fit one natural situation; ignore the rest. Particles, auxiliaries, conjugated endings, pronouns, counters, and the words of the target grammar itself are always allowed.
4. Length: one sentence of 10 to 30 Japanese characters.
5. Realism: natural everyday Japanese that a native speaker would say, in a plausible real-world situation. No nonsense combinations.

Fields:
- japanese: the sentence.
- english: one natural English translation.
- breakdown: the sentence split into words and particles, in order. For each: text as written, short English meaning or grammatical role.
- grammarExplanation: 2 to 4 short English sentences for a learner. Explain what the target grammar means, how it is formed, and how it works in this sentence.
- example: one more short sentence that uses the same target grammar, with its English translation. Follow the same kanji and vocabulary rules.`

type GrammarId = (typeof GRAMMAR)[number]['id']
const grammarIds = GRAMMAR.map((g) => g.id) as [GrammarId, ...GrammarId[]]

const generateInput = z.object({
  grammarId: z.enum(grammarIds),
  sample: z.array(z.object({ characters: z.string().max(20), meaning: z.string().max(80) })).max(300),
  kanji: z.string().max(3000),
})

const exerciseSchema = z.object({
  japanese: z.string(),
  english: z.string(),
  breakdown: z.array(z.object({ text: z.string(), meaning: z.string() })),
  grammarExplanation: z.string(),
  example: z.object({ japanese: z.string(), english: z.string() }),
})

export type Exercise = z.infer<typeof exerciseSchema> & { grammarId: GrammarId }
export type ExerciseError = 'daily_limit' | 'exercise_failed'
export type Result<T> = { ok: true; value: T } | { ok: false; error: ExerciseError }

class DailyLimit extends Error {}

/** Counts LLM calls per UTC day in this instance. It resets on cold start, so it only stops runaway loops. */
let capDay = ''
let capCalls = 0
function takeCall() {
  const day = new Date().toISOString().slice(0, 10)
  if (day !== capDay) {
    capDay = day
    capCalls = 0
  }
  if (capCalls >= DAILY_LLM_CALL_CAP) throw new DailyLimit()
  capCalls++
}

const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })
const model = () =>
  openrouter(process.env.OPENROUTER_MODEL || DEFAULT_MODEL, {
    provider: { require_parameters: true },
    plugins: [{ id: 'response-healing' }],
  })

/** One counted LLM call, validated against `schema`. OpenRouter 402 and 429 mean the key or the platform cap is used up. */
async function llm<T>(system: string, prompt: string, schema: z.ZodType<T>): Promise<T> {
  takeCall()
  try {
    const res = await generateText({ model: model(), system, prompt, output: Output.object({ schema }), maxRetries: 0 })
    return res.output
  } catch (e) {
    if (APICallError.isInstance(e) && (e.statusCode === 402 || e.statusCode === 429)) throw new DailyLimit()
    throw e
  }
}

export async function generateExercise(input: z.input<typeof generateInput>): Promise<Result<Exercise>> {
  const { grammarId, sample, kanji } = generateInput.parse(input)
  const grammar = GRAMMAR.find((g) => g.id === grammarId)!
  const prompt = [
    `TARGET GRAMMAR: ${grammar.pattern} — ${grammar.meaning} (JLPT ${grammar.level})`,
    `ALLOWED KANJI: ${kanji}`,
    `WORD LIST:\n${sample.map((w) => `${w.characters} = ${w.meaning}`).join('\n')}`,
  ].join('\n\n')
  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      const exercise = await llm(GENERATE_SYSTEM, prompt, exerciseSchema)
      if (kanjiViolations(exercise.japanese + exercise.example.japanese, kanji).length === 0)
        return { ok: true, value: { grammarId, ...exercise } }
    }
    return { ok: false, error: 'exercise_failed' }
  } catch (e) {
    if (e instanceof DailyLimit) return { ok: false, error: 'daily_limit' }
    throw e
  }
}
