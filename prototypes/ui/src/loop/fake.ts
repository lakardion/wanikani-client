/** PROTOTYPE: in-memory fake exercise loop. No LLM calls; timers stand in for latency. */
import { createSignal } from 'solid-js'

export type Step = 'waiting' | 'answering' | 'grading' | 'retry' | 'explanation' | 'error'
export type ErrorKind = 'daily_limit' | 'exercise_failed' | 'other'
export type Grade = { score: number; feedback: string; pass: boolean }

export const EXERCISE = {
  grammar: { pattern: '〜てから', meaning: 'after doing ~' },
  japanese: '宿題をしてから、友達と公園で遊びました。',
  reading: 'しゅくだいをしてから、ともだちとこうえんであそびました。',
  english: 'After doing my homework, I played in the park with a friend.',
  breakdown: [
    { text: '宿題', reading: 'しゅくだい', meaning: 'homework' },
    { text: 'をして', reading: 'をして', meaning: 'doing (object + する, te-form)' },
    { text: 'から', reading: 'から', meaning: 'after' },
    { text: '友達', reading: 'ともだち', meaning: 'friend' },
    { text: 'と', reading: 'と', meaning: 'with' },
    { text: '公園', reading: 'こうえん', meaning: 'park' },
    { text: 'で', reading: 'で', meaning: 'at (place of action)' },
    { text: '遊びました', reading: 'あそびました', meaning: 'played' },
  ],
  grammarExplanation:
    'Verb te-form + から means "after doing A, B". It puts the two actions in order: A ends first, then B starts. Here して is the te-form of する.',
  example: { japanese: '手を洗ってから、ご飯を食べます。', reading: 'てをあらってから、ごはんをたべます。', english: 'I eat after I wash my hands.' },
}

const FAIL_1: Grade = { score: 40, feedback: 'You have the park and the friend, but the order is lost: から says the homework came first.', pass: false }
const FAIL_2: Grade = { score: 55, feedback: 'Closer. The homework is there now, but "while" is not "after".', pass: false }
const PASS: Grade = { score: 88, feedback: 'Good. The order and every part of the sentence are there.', pass: true }

export const [step, setStep] = createSignal<Step>('waiting')
export const [errorKind, setErrorKind] = createSignal<ErrorKind>('other')
export const [grade, setGrade] = createSignal<Grade | null>(null)
export const [gaveUp, setGaveUp] = createSignal(false)
export const [elapsed, setElapsed] = createSignal(0)
/** True while waiting for the prefetched exercise after Next; the first wait of a Session is false. */
export const [nextWait, setNextWait] = createSignal(false)
export const [prefetchReady, setPrefetchReady] = createSignal(true)
export const [generationOff, setGenerationOff] = createSignal(false)
export const [count, setCount] = createSignal({ passed: 3, done: 5 })
let attempt = 0

let tick: number | undefined
/** Fakes generation: counts seconds, lands on `answering` after `seconds`. */
export function wait(seconds = 8, isNext = false) {
  clearInterval(tick)
  setNextWait(isNext)
  setElapsed(0)
  setStep('waiting')
  tick = setInterval(() => {
    setElapsed(elapsed() + 1)
    if (elapsed() >= seconds) startExercise()
  }, 1000) as unknown as number
}

export function startExercise() {
  clearInterval(tick)
  attempt = 0
  setGrade(null)
  setGaveUp(false)
  setStep('answering')
}

const isGiveUp = (a: string) => a.trim() === '' || a.trim() === '?'

/** Fake grader: an answer with "after" passes; anything else fails. */
export function submit(answer: string) {
  if (isGiveUp(answer)) return finish(true)
  setStep('grading')
  setTimeout(() => {
    attempt++
    const g = /after/i.test(answer) ? PASS : attempt === 1 ? FAIL_1 : FAIL_2
    setGrade(g)
    if (g.pass || attempt === 2) finish(false)
    else setStep('retry')
  }, 1500)
}

function finish(gave: boolean) {
  setGaveUp(gave)
  if (gave) setGrade(null)
  setCount({ passed: count().passed + (grade()?.pass ? 1 : 0), done: count().done + 1 })
  setStep('explanation')
}

export function next() {
  if (generationOff()) return
  if (prefetchReady()) startExercise()
  else wait(5, true)
}

export function fail(kind: ErrorKind) {
  clearInterval(tick)
  setErrorKind(kind)
  if (kind === 'daily_limit') setGenerationOff(true)
  setStep('error')
}

export function retryGeneration() {
  wait(4)
}

/** Jumps for the switcher bar. */
export function jump(to: string) {
  setGenerationOff(false)
  clearInterval(tick)
  if (to === 'waiting') return wait(8)
  if (to === 'next-wait') return wait(5, true)
  if (to === 'answering') return startExercise()
  if (to === 'retry') return startExercise(), (attempt = 1), setGrade(FAIL_1), setStep('retry')
  if (to === 'pass') return startExercise(), setGrade(PASS), setStep('explanation')
  if (to === 'failed') return startExercise(), setGrade(FAIL_2), setStep('explanation')
  if (to === 'gave-up') return startExercise(), setGaveUp(true), setStep('explanation')
  fail(to as ErrorKind)
}
export const JUMPS = ['waiting', 'next-wait', 'answering', 'retry', 'pass', 'failed', 'gave-up', 'daily_limit', 'exercise_failed', 'other']
export const ERRORS: Record<ErrorKind, string> = {
  daily_limit: 'Daily limit reached.',
  exercise_failed: 'Could not make an exercise.',
  other: 'Something went wrong.',
}
