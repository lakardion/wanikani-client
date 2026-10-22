/** PROTOTYPE: three structurally different takes on the exercise loop. Fake data only. */
import { createSignal, For, Match, Show, Switch, type JSX } from 'solid-js'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '~/components/ui/drawer'
import { TextField, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field'
import { Spinner } from '../spinner'
import {
  count, elapsed, ERRORS, errorKind, EXERCISE as X, gaveUp, generationOff, grade, next, nextWait, retryGeneration, step, submit,
} from './fake'

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const empty = (a: string) => a.trim() === '' || a.trim() === '?'

const Gear = () => (
  <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
  </svg>
)

/** Same header as setup layout A; `extra` is where a variant puts the count. */
function Header(props: { extra?: JSX.Element }) {
  return (
    <header class="flex h-14 items-center justify-between gap-2">
      <span class="font-semibold">漢字 practice</span>
      <div class="flex items-center gap-1">
        {props.extra}
        <Button variant="ghost" size="icon" aria-label="Settings (inert here)">
          <Gear />
        </Button>
      </div>
    </header>
  )
}

const CountText = () => (
  <span class="text-sm tabular-nums text-muted-foreground">
    {count().passed} / {count().done} passed
  </span>
)

const Sentence = (props: { class?: string; reading?: boolean }) => (
  <div class={props.class}>
    <p lang="ja" class="text-2xl leading-relaxed">{X.japanese}</p>
    <Show when={props.reading}>
      <p lang="ja" class="text-sm text-muted-foreground">{X.reading}</p>
    </Show>
  </div>
)

function Verdict() {
  return (
    <Switch>
      <Match when={gaveUp()}>
        <Badge variant="secondary">Gave up</Badge>
      </Match>
      <Match when={grade()}>
        {(g) => (
          <div class="flex flex-col gap-1">
            <Badge variant={g().pass ? 'default' : 'secondary'} class="w-fit">
              {g().pass ? 'Pass' : 'Not passed'} · {g().score}
            </Badge>
            <p class="text-sm">{g().feedback}</p>
          </div>
        )}
      </Match>
    </Switch>
  )
}

const Breakdown = () => (
  <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
    <For each={X.breakdown}>
      {(w) => (
        <>
          <dt lang="ja">
            <span class="text-base">{w.text}</span>
            <span class="block text-xs text-muted-foreground">{w.reading}</span>
          </dt>
          <dd class="self-center">{w.meaning}</dd>
        </>
      )}
    </For>
  </dl>
)

const Grammar = () => (
  <div class="flex flex-col gap-1 text-sm">
    <p>
      <span lang="ja" class="font-semibold">{X.grammar.pattern}</span> {X.grammar.meaning}
    </p>
    <p class="text-muted-foreground">{X.grammarExplanation}</p>
  </div>
)

const Example = () => (
  <div class="flex flex-col gap-0.5 text-sm">
    <p lang="ja" class="text-base">{X.example.japanese}</p>
    <p lang="ja" class="text-xs text-muted-foreground">{X.example.reading}</p>
    <p>{X.example.english}</p>
  </div>
)

const Section = (props: { title: string; children: JSX.Element }) => (
  <section class="flex flex-col gap-2">
    <h3 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{props.title}</h3>
    {props.children}
  </section>
)

function WaitText() {
  return (
    <>
      <span class="text-3xl tabular-nums">{mmss(elapsed())}</span>
      <span class="text-sm text-muted-foreground">
        {nextWait() ? 'The next exercise is still generating.' : 'The first exercise takes about a minute.'}
      </span>
    </>
  )
}

function ErrorBox(props: { class?: string }) {
  return (
    <Alert variant={errorKind() === 'daily_limit' ? 'default' : 'destructive'} class={props.class}>
      <AlertTitle>{ERRORS[errorKind()]}</AlertTitle>
      <AlertDescription>
        <Show
          when={errorKind() !== 'daily_limit'}
          fallback="Generation stays off until you reload the page."
        >
          <Button size="sm" variant="outline" class="mt-2" onClick={retryGeneration}>
            Retry
          </Button>
        </Show>
      </AlertDescription>
    </Alert>
  )
}

/** Answer input; `inline` puts the buttons on the same row. */
function AnswerForm(props: { giveUpButton?: boolean; class?: string }) {
  const [answer, setAnswer] = createSignal('')
  const busy = () => step() === 'grading'
  return (
    <form
      class={props.class}
      onSubmit={(e) => {
        e.preventDefault()
        submit(answer())
        setAnswer('')
      }}
    >
      <TextField value={answer()} onChange={setAnswer} disabled={busy()}>
        <TextFieldLabel class="sr-only">Your English translation</TextFieldLabel>
        <TextFieldInput placeholder="Type the meaning in English" autocomplete="off" enterkeyhint="send" />
      </TextField>
      <div class="mt-3 flex gap-2">
        <Show when={props.giveUpButton}>
          <Button type="button" variant="ghost" disabled={busy()} onClick={() => submit('')}>
            Give up
          </Button>
        </Show>
        <Button type="submit" class="flex-1" disabled={busy()}>
          <Show when={!busy()} fallback={<><Spinner class="size-4" /> Grading</>}>
            {!props.giveUpButton && empty(answer()) ? 'Give up' : step() === 'retry' ? 'Try again' : 'Check'}
          </Show>
        </Button>
      </div>
    </form>
  )
}

const NextButton = (props: { class?: string }) => (
  <Button class={props.class} disabled={generationOff()} onClick={next}>
    Next
  </Button>
)

/* ---------------------------------------------------------------- A: Card */

/** A: setup layout A carried on. One card per step; the Explanation is one long card with sections. */
export function VariantA() {
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-40">
      <Header extra={<CountText />} />
      <Switch>
        <Match when={step() === 'waiting'}>
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Spinner /> Making an exercise
              </CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-1">
              <WaitText />
            </CardContent>
          </Card>
        </Match>
        <Match when={step() === 'error'}>
          <ErrorBox />
        </Match>
        <Match when={step() === 'answering' || step() === 'grading' || step() === 'retry'}>
          <Card>
            <CardHeader>
              <CardDescription>Translate to English</CardDescription>
              <Sentence />
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
              <Show when={step() === 'retry' || (step() === 'grading' && grade())}>
                <div class="rounded-md bg-muted p-3">
                  <Verdict />
                  <p class="mt-2 text-xs text-muted-foreground">One more try.</p>
                </div>
              </Show>
              <AnswerForm />
              <p class="text-xs text-muted-foreground">Leave it empty or type ? to give up.</p>
            </CardContent>
          </Card>
        </Match>
        <Match when={step() === 'explanation'}>
          <Card>
            <CardHeader class="gap-3">
              <Verdict />
              <Sentence reading />
              <p class="text-sm">{X.english}</p>
            </CardHeader>
            <CardContent class="flex flex-col gap-6">
              <Section title="Breakdown"><Breakdown /></Section>
              <Section title="Grammar"><Grammar /></Section>
              <Section title="Example"><Example /></Section>
            </CardContent>
            <CardFooter>
              <NextButton class="w-full" />
            </CardFooter>
          </Card>
        </Match>
      </Switch>
    </div>
  )
}

/* ---------------------------------------------------------- B: Thumb zone */

/** B: no cards. The sentence sits mid-screen, the input is pinned at the bottom, the Explanation is a bottom sheet. */
export function VariantB() {
  const inLoop = () => step() !== 'waiting' && step() !== 'error'
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col px-5">
      <Header />
      <div class="flex justify-center">
        <Badge variant="outline" class="tabular-nums">
          ✓ {count().passed} · {count().done} done
        </Badge>
      </div>
      <div class={`flex flex-1 flex-col gap-4 py-8 text-center ${step() === 'explanation' ? 'justify-start' : 'justify-center'}`}>
        <Switch>
          <Match when={step() === 'waiting'}>
            <div class="flex flex-col items-center gap-2">
              <Spinner class="size-8" />
              <WaitText />
            </div>
          </Match>
          <Match when={step() === 'error'}>
            <ErrorBox class="text-left" />
          </Match>
          <Match when={inLoop()}>
            <Sentence class="text-3xl" reading={step() === 'explanation'} />
            <Show when={step() === 'retry'}>
              <div class="mx-auto max-w-xs rounded-2xl bg-muted px-4 py-3 text-left">
                <Verdict />
              </div>
            </Show>
          </Match>
        </Switch>
      </div>
      <Show when={inLoop() && step() !== 'explanation'}>
        <div class="sticky bottom-0 -mx-5 border-t bg-background px-5 pb-40 pt-3">
          <AnswerForm giveUpButton />
        </div>
      </Show>
      <Drawer open={step() === 'explanation'} onOpenChange={() => {}} closeOnOutsidePointer={false}>
        <DrawerContent class="max-h-[62dvh]">
          <DrawerHeader class="text-left">
            <DrawerTitle class="sr-only">Explanation</DrawerTitle>
            <Verdict />
            <p class="mt-2 text-sm">{X.english}</p>
          </DrawerHeader>
          <div class="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
            <Section title="Breakdown"><Breakdown /></Section>
            <Section title="Grammar"><Grammar /></Section>
            <Section title="Example"><Example /></Section>
          </div>
          <div class="border-t p-4 pb-36">
            <NextButton class="w-full" />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

/* -------------------------------------------------------- C: Verdict strip */

/** C: flat page. A colored strip carries count and verdict; Explanation parts fold open; Next is sticky. */
export function VariantC() {
  const strip = () =>
    step() === 'explanation'
      ? gaveUp()
        ? 'bg-muted'
        : grade()?.pass
          ? 'bg-primary text-primary-foreground'
          : 'bg-accent text-accent-foreground'
      : step() === 'retry'
        ? 'bg-accent text-accent-foreground'
        : 'bg-secondary'
  const Fold = (p: { title: string; open?: boolean; children: JSX.Element }) => (
    <details open={p.open} class="group border-b py-3">
      <summary class="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
        {p.title}
        <span class="text-muted-foreground transition group-open:rotate-90">›</span>
      </summary>
      <div class="pt-3">{p.children}</div>
    </details>
  )
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col">
      <div class="px-4">
        <Header />
      </div>
      <div class={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${strip()}`}>
        <span class="tabular-nums">
          {count().passed} passed · {count().done} done
        </span>
        <Show when={step() === 'explanation' || step() === 'retry'}>
          <span class="font-medium">
            {gaveUp() ? 'Gave up' : `${grade()?.pass ? 'Pass' : step() === 'retry' ? 'Try once more' : 'Not passed'} · ${grade()?.score}`}
          </span>
        </Show>
      </div>
      <main class="flex flex-1 flex-col gap-4 px-4 pb-40 pt-6">
        <Switch>
          <Match when={step() === 'waiting'}>
            <div class="flex flex-col gap-3">
              <div class="h-9 w-full animate-pulse rounded bg-muted" />
              <div class="h-9 w-2/3 animate-pulse rounded bg-muted" />
              <div class="flex items-center gap-2">
                <Spinner class="size-4" /> <WaitText />
              </div>
            </div>
          </Match>
          <Match when={step() === 'error'}>
            <ErrorBox />
          </Match>
          <Match when={step() !== 'explanation'}>
            <Sentence />
            <Show when={step() === 'retry'}>
              <p class="border-l-2 border-primary pl-3 text-sm">{grade()?.feedback}</p>
            </Show>
            <AnswerForm giveUpButton />
          </Match>
          <Match when={step() === 'explanation'}>
            <Show when={grade()}>
              <p class="border-l-2 border-primary pl-3 text-sm">{grade()?.feedback}</p>
            </Show>
            <Sentence reading />
            <p class="text-sm">{X.english}</p>
            <div>
              <Fold title="Breakdown" open><Breakdown /></Fold>
              <Fold title={`Grammar: ${X.grammar.pattern}`}><Grammar /></Fold>
              <Fold title="Example"><Example /></Fold>
            </div>
            <div class="sticky bottom-28 mt-auto">
              <NextButton class="w-full shadow-lg" />
            </div>
          </Match>
        </Switch>
      </main>
    </div>
  )
}
