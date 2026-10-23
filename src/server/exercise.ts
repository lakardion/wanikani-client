'use server'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { APICallError, generateText, NoObjectGeneratedError, Output } from 'ai'
import { z } from 'zod'
import { isPass } from '~/lib/grading'
import { GRAMMAR } from '~/lib/grammar'
import { kanjiViolations } from '~/lib/kanji'
import { reading } from './tokenizer'

const DAILY_LLM_CALL_CAP = 300
const DEFAULT_MODEL = 'openai/gpt-6-luna'

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

const GRADE_SYSTEM = `You grade a learner's English translation of a Japanese sentence.

Score 0 to 100 for MEANING only. Ignore English spelling, grammar, punctuation, capitalisation, and word choice when the meaning is the same. The reference is one valid translation, not the only one; judge against the Japanese.

Rubric:
- 90-100: same meaning; only phrasing differs.
- 70-89: core meaning right; one minor detail off (a modifier, a nuance of politeness, singular/plural, a small omitted word).
- 40-69: one key element wrong: tense, negation, who does what to whom, the meaning of the target grammar, or a key content word.
- 0-39: mostly wrong, unrelated, or empty.

feedback: one or two short English sentences. At 90 or more, confirm briefly. Below 90, name the specific part that is off (which word or which meaning). Never write out the full correct translation.`

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

const gradeInput = z.object({
  grammarId: z.enum(grammarIds),
  japanese: z.string().max(200),
  english: z.string().max(400),
  answer: z.string().max(400),
})

const gradeSchema = z.object({ score: z.number().int().min(0).max(100), feedback: z.string() })

export type Grade = z.infer<typeof gradeSchema> & { pass: boolean }
type Generated = z.infer<typeof exerciseSchema>
export type Exercise = Omit<Generated, 'breakdown' | 'example'> & {
  grammarId: GrammarId
  reading: string
  breakdown: (Generated['breakdown'][number] & { reading: string })[]
  example: Generated['example'] & { reading: string }
}
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
    provider: { require_parameters: true, sort: 'price' },
    reasoning: { effort: 'none' },
    plugins: [{ id: 'response-healing' }],
  })

/** One counted LLM call, validated against `schema`. OpenRouter 402 and 429 mean the key or the platform cap is used up. */
async function llm<T>(system: string, prompt: string, schema: z.ZodType<T>): Promise<T> {
  takeCall()
  try {
    const res = await generateText({ model: model(), system, prompt, output: Output.object({ schema }), maxOutputTokens: 1000, maxRetries: 0 })
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
      /** A reply cut off by `maxOutputTokens` fails validation; it counts as a failed attempt. */
      const exercise = await llm(GENERATE_SYSTEM, prompt, exerciseSchema).catch((e) => {
        if (NoObjectGeneratedError.isInstance(e)) return null
        throw e
      })
      if (exercise && kanjiViolations(exercise.japanese + exercise.example.japanese, kanji).length === 0)
        return {
          ok: true,
          value: {
            ...exercise,
            grammarId,
            reading: reading(exercise.japanese),
            breakdown: exercise.breakdown.map((w) => ({ ...w, reading: reading(w.text) })),
            example: { ...exercise.example, reading: reading(exercise.example.japanese) },
          },
        }
    }
    return { ok: false, error: 'exercise_failed' }
  } catch (e) {
    if (e instanceof DailyLimit) return { ok: false, error: 'daily_limit' }
    throw e
  }
}

export async function gradeAnswer(input: z.input<typeof gradeInput>): Promise<Result<Grade>> {
  const { grammarId, japanese, english, answer } = gradeInput.parse(input)
  const grammar = GRAMMAR.find((g) => g.id === grammarId)!
  const prompt = [
    `JAPANESE: ${japanese}`,
    `REFERENCE TRANSLATION: ${english}`,
    `TARGET GRAMMAR: ${grammar.pattern} — ${grammar.meaning}`,
    `LEARNER ANSWER: ${answer}`,
  ].join('\n')
  try {
    const grade = await llm(GRADE_SYSTEM, prompt, gradeSchema)
    return { ok: true, value: { ...grade, pass: isPass(grade.score) } }
  } catch (e) {
    if (e instanceof DailyLimit) return { ok: false, error: 'daily_limit' }
    throw e
  }
}
