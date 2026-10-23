import { createSignal, For, Match, onCleanup, onMount, Show, Switch, type JSX } from 'solid-js'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '~/components/ui/drawer'
import { Spinner } from '~/components/ui/spinner'
import { TextField, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field'
import { isGiveUp } from '~/lib/grading'
import { GRAMMAR, randomGrammar } from '~/lib/grammar'
import type { KnownItem } from '~/lib/known-items'
import type { Segment } from '~/lib/reading'
import { wordSample } from '~/lib/word-sample'
import { generateExercise, gradeAnswer, type Exercise, type ExerciseError, type Grade } from '~/server/exercise'

type Failure = ExerciseError | 'other'
type Step = { name: 'waiting' } | { name: 'answering' | 'explanation'; exercise: Exercise } | { name: 'error'; error: Failure }

const ERRORS: Record<Failure, string> = {
  daily_limit: 'Daily limit reached.',
  exercise_failed: 'Could not make an exercise.',
  other: 'Something went wrong.',
}

/** Set by `daily_limit`; generation stays off until reload. */
const [generationOff, setGenerationOff] = createSignal(false)
/** The **Session** count, in memory only. */
const [count, setCount] = createSignal({ passed: 0, done: 0 })

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function Waiting(props: { first: boolean }) {
  const [elapsed, setElapsed] = createSignal(0)
  const timer = setInterval(() => setElapsed((s) => s + 1), 1000)
  onCleanup(() => clearInterval(timer))
  return (
    <div class="flex flex-col items-center gap-2">
      <Spinner class="size-8" />
      <span class="text-3xl tabular-nums">{mmss(elapsed())}</span>
      <span class="text-sm text-muted-foreground">
        {props.first ? 'Generating the first exercise.' : 'The next exercise is still generating.'}
      </span>
    </div>
  )
}

const Section = (props: { title: string; children: JSX.Element }) => (
  <section class="flex flex-col gap-2">
    <h3 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{props.title}</h3>
    {props.children}
  </section>
)

/** Japanese text with furigana above each kanji run. */
const Furigana = (props: { segments: Segment[] }) => (
  <For each={props.segments}>
    {(s) => (
      <Show when={s.ruby} fallback={s.text}>
        <ruby>
          {s.text}
          <rt class="text-muted-foreground">{s.ruby}</rt>
        </ruby>
      </Show>
    )}
  </For>
)

/** The last grade, or "Gave up" when there is none. */
function Verdict(props: { grade: Grade | null }) {
  return (
    <Show when={props.grade} fallback={<Badge variant="secondary" class="w-fit">Gave up</Badge>}>
      {(g) => (
        <div class="flex flex-col gap-1">
          <Badge variant={g().pass ? 'default' : 'secondary'} class="w-fit">
            {g().pass ? 'Pass' : 'Not passed'} · {g().score}
          </Badge>
          <p class="text-sm">{g().feedback}</p>
        </div>
      )}
    </Show>
  )
}

function Explanation(props: { exercise: Exercise }) {
  const grammar = () => GRAMMAR.find((g) => g.id === props.exercise.grammarId)
  return (
    <div class="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
      <Section title="Breakdown">
        <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <For each={props.exercise.breakdown}>
            {(w) => (
              <>
                <dt lang="ja" class="text-base">
                  <Furigana segments={w.furigana} />
                </dt>
                <dd class="self-center">{w.meaning}</dd>
              </>
            )}
          </For>
        </dl>
      </Section>
      <Section title="Grammar">
        <div class="flex flex-col gap-1 text-sm">
          <p>
            <span lang="ja" class="font-semibold">
              {grammar()?.pattern}
            </span>{' '}
            {grammar()?.meaning}
          </p>
          <p class="text-muted-foreground">{props.exercise.grammarExplanation}</p>
        </div>
      </Section>
      <Section title="Example">
        <div class="flex flex-col gap-0.5 text-sm">
          <p lang="ja" class="text-base leading-loose">
            <Furigana segments={props.exercise.example.furigana} />
          </p>
          <p>{props.exercise.example.english}</p>
        </div>
      </Section>
    </div>
  )
}

export default function ExerciseLoop(props: { items: KnownItem[] }) {
  const [step, setStep] = createSignal<Step>({ name: 'waiting' })
  const [first, setFirst] = createSignal(true)
  const [answer, setAnswer] = createSignal('')
  /** The last grade of the current **Exercise**; a failed one means the retry is used. */
  const [grade, setGrade] = createSignal<Grade | null>(null)
  const [grading, setGrading] = createSignal(false)
  /** A failed `gradeAnswer` call; the answer stays so Check can send it again. */
  const [gradeError, setGradeError] = createSignal<Failure | null>(null)
  let run = 0

  async function generate() {
    const current = ++run
    setStep({ name: 'waiting' })
    setAnswer('')
    setGrade(null)
    setGradeError(null)
    const { sample, kanji } = wordSample(props.items)
    try {
      const res = await generateExercise({ grammarId: randomGrammar().id, sample, kanji })
      if (current !== run) return
      if (res.ok) setStep({ name: 'answering', exercise: res.value })
      else {
        if (res.error === 'daily_limit') setGenerationOff(true)
        setStep({ name: 'error', error: res.error })
      }
    } catch {
      if (current === run) setStep({ name: 'error', error: 'other' })
    }
  }

  function explain(exercise: Exercise) {
    setCount((c) => ({ passed: c.passed + (grade()?.pass ? 1 : 0), done: c.done + 1 }))
    setStep({ name: 'explanation', exercise })
  }

  async function submit(text: string) {
    const x = exercise()!
    if (isGiveUp(text)) {
      setGrade(null)
      return explain(x)
    }
    const current = run
    const retried = grade() !== null
    setGrading(true)
    setGradeError(null)
    try {
      const res = await gradeAnswer({ grammarId: x.grammarId, japanese: x.japanese, english: x.english, answer: text })
      if (current !== run) return
      if (!res.ok) {
        if (res.error === 'daily_limit') setGenerationOff(true)
        return setGradeError(res.error)
      }
      setGrade(res.value)
      setAnswer('')
      if (res.value.pass || retried) explain(x)
    } catch {
      if (current === run) setGradeError('other')
    } finally {
      if (current === run) setGrading(false)
    }
  }

  function next() {
    setFirst(false)
    void generate()
  }

  onMount(() => (generationOff() ? setStep({ name: 'error', error: 'daily_limit' }) : void generate()))
  onCleanup(() => run++)

  const exercise = () => {
    const s = step()
    return s.name === 'answering' || s.name === 'explanation' ? s.exercise : undefined
  }
  const failure = () => {
    const s = step()
    return s.name === 'error' ? s.error : undefined
  }
  const explaining = () => step().name === 'explanation'

  return (
    <>
      <div class="flex justify-center">
        <Badge variant="outline" class="tabular-nums">
          ✓ {count().passed} · {count().done} done
        </Badge>
      </div>
      <div class={`flex flex-1 flex-col gap-4 py-8 text-center ${explaining() ? 'justify-start' : 'justify-center'}`}>
        <Switch>
          <Match when={step().name === 'waiting'}>
            <Waiting first={first()} />
          </Match>
          <Match when={failure()}>
            {(error) => (
              <Alert variant={error() === 'daily_limit' ? 'default' : 'destructive'} class="text-left">
                <AlertTitle>{ERRORS[error()]}</AlertTitle>
                <AlertDescription>
                  <Show when={error() !== 'daily_limit'} fallback="Generation stays off until you reload the page.">
                    <Button size="sm" variant="outline" class="mt-2" onClick={() => void generate()}>
                      Retry
                    </Button>
                  </Show>
                </AlertDescription>
              </Alert>
            )}
          </Match>
          <Match when={exercise()}>
            {(x) => (
              <>
                <p lang="ja" class="text-3xl leading-relaxed">
                  <Show when={explaining()} fallback={x().japanese}>
                    <Furigana segments={x().furigana} />
                  </Show>
                </p>
                <Show when={!explaining()}>
                  <Switch>
                    <Match when={gradeError()}>
                      {(error) => (
                        <Alert variant={error() === 'daily_limit' ? 'default' : 'destructive'} class="text-left">
                          <AlertTitle>{ERRORS[error()]}</AlertTitle>
                          <AlertDescription>
                            {error() === 'daily_limit'
                              ? 'Generation stays off until you reload the page.'
                              : 'Check again to send the same answer.'}
                          </AlertDescription>
                        </Alert>
                      )}
                    </Match>
                    <Match when={grade()}>
                      <div class="mx-auto max-w-xs rounded-2xl bg-muted px-4 py-3 text-left">
                        <Verdict grade={grade()} />
                      </div>
                    </Match>
                  </Switch>
                </Show>
              </>
            )}
          </Match>
        </Switch>
      </div>
      <Show when={step().name === 'answering'}>
        <div class="sticky bottom-0 -mx-4 border-t bg-background px-4 pb-6 pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void submit(answer())
            }}
          >
            <TextField value={answer()} onChange={setAnswer} disabled={grading()}>
              <TextFieldLabel class="sr-only">Your English translation</TextFieldLabel>
              <TextFieldInput placeholder="Type the meaning in English" autocomplete="off" enterkeyhint="send" />
            </TextField>
            <div class="mt-3 flex gap-2">
              <Button type="button" variant="ghost" disabled={grading()} onClick={() => void submit('')}>
                Give up
              </Button>
              <Button type="submit" class="flex-1" disabled={grading()}>
                <Show when={!grading()} fallback={<><Spinner class="size-4" /> Grading</>}>
                  {grade() ? 'Try again' : 'Check'}
                </Show>
              </Button>
            </div>
          </form>
        </div>
      </Show>
      <Drawer open={explaining()} onOpenChange={() => {}} closeOnOutsidePointer={false}>
        <DrawerContent class="max-h-[62dvh]">
          <Show when={exercise()}>
            {(x) => (
              <>
                <DrawerHeader class="text-left">
                  <DrawerTitle class="sr-only">Explanation</DrawerTitle>
                  <Verdict grade={grade()} />
                  <p class="mt-2 text-sm">{x().english}</p>
                </DrawerHeader>
                <Explanation exercise={x()} />
                <div class="border-t p-4 pb-6">
                  <Button class="w-full" disabled={generationOff()} onClick={next}>
                    Next
                  </Button>
                </div>
              </>
            )}
          </Show>
        </DrawerContent>
      </Drawer>
    </>
  )
}
