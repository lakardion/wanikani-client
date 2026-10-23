import { createSignal, For, Match, onCleanup, onMount, Show, Switch, type JSX } from 'solid-js'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '~/components/ui/drawer'
import { Spinner } from '~/components/ui/spinner'
import { GRAMMAR, randomGrammar } from '~/lib/grammar'
import type { KnownItem } from '~/lib/known-items'
import { wordSample } from '~/lib/word-sample'
import { generateExercise, type Exercise, type ExerciseError } from '~/server/exercise'

type Failure = ExerciseError | 'other'
type Step = { name: 'waiting' } | { name: 'answering' | 'explanation'; exercise: Exercise } | { name: 'error'; error: Failure }

const ERRORS: Record<Failure, string> = {
  daily_limit: 'Daily limit reached.',
  exercise_failed: 'Could not make an exercise.',
  other: 'Something went wrong.',
}

/** Set by `daily_limit`; generation stays off until reload. */
const [generationOff, setGenerationOff] = createSignal(false)

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
                  {w.text}
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
          <p lang="ja" class="text-base">
            {props.exercise.example.japanese}
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
  let run = 0

  async function generate() {
    const current = ++run
    setStep({ name: 'waiting' })
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
              <p lang="ja" class="text-3xl leading-relaxed">
                {x().japanese}
              </p>
            )}
          </Match>
        </Switch>
      </div>
      <Show when={step().name === 'answering'}>
        <div class="sticky bottom-0 -mx-4 border-t bg-background px-4 pb-6 pt-3">
          <Button class="w-full" onClick={() => setStep({ name: 'explanation', exercise: exercise()! })}>
            Reveal
          </Button>
        </div>
      </Show>
      <Drawer open={explaining()} onOpenChange={() => {}} closeOnOutsidePointer={false}>
        <DrawerContent class="max-h-[62dvh]">
          <Show when={exercise()}>
            {(x) => (
              <>
                <DrawerHeader class="text-left">
                  <DrawerTitle class="sr-only">Explanation</DrawerTitle>
                  <p class="text-sm">{x().english}</p>
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
