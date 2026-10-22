/** PROTOTYPE: three structurally different takes on the setup screens. Fake data only. */
import { createSignal, Match, Show, Switch, type JSX } from 'solid-js'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { TextField, TextFieldDescription, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field'
import {
  clearKey, known, lastSync, NOTE, progress, refresh, refreshing, screen, setSyncError, startFirstRun, syncError, TOTAL,
} from './fake'
import { Spinner } from './spinner'

const Gear = () => (
  <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const fmt = (n: number) => n.toLocaleString('en-US')

/** Key form: same fields in every variant, the layout around it changes. */
function KeyField(props: { onSave: () => void; class?: string }) {
  const [value, setValue] = createSignal('')
  return (
    <form
      class={props.class}
      onSubmit={(e) => {
        e.preventDefault()
        props.onSave()
      }}
    >
      <TextField value={value()} onChange={setValue}>
        <TextFieldLabel>WaniKani API token</TextFieldLabel>
        <TextFieldInput type="password" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" autocomplete="off" />
        <TextFieldDescription>{NOTE}</TextFieldDescription>
      </TextField>
      <Button type="submit" class="mt-4 w-full">
        Save and sync
      </Button>
    </form>
  )
}

/** Settings actions: change key, clear key, Refresh, Rebuild. */
function SettingsActions(props: { onDone?: () => void }) {
  const [changing, setChanging] = createSignal(false)
  return (
    <div class="flex flex-col gap-3 text-sm">
      <div class="text-muted-foreground">
        {fmt(known.words)} known words · {fmt(known.kanji)} known kanji
        <br />
        Last sync {lastSync()}
      </div>
      <div class="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" disabled={refreshing()} onClick={() => refresh()}>
          <Show when={refreshing()} fallback="Refresh">
            <Spinner class="size-4" />
          </Show>
        </Button>
        <Button variant="outline" size="sm" onClick={() => (props.onDone?.(), startFirstRun())}>
          Rebuild
        </Button>
      </div>
      <p class="text-xs text-muted-foreground">Rebuild deletes the stored items and downloads them again. Use it after WaniKani edits a subject.</p>
      <hr />
      <Show
        when={changing()}
        fallback={
          <div class="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setChanging(true)}>
              Change key
            </Button>
            <Button variant="destructive" size="sm" onClick={() => (props.onDone?.(), clearKey())}>
              Clear key
            </Button>
          </div>
        }
      >
        <KeyField onSave={() => (props.onDone?.(), startFirstRun())} />
      </Show>
      <p class="text-xs text-muted-foreground">Changing or clearing the key also deletes the stored items.</p>
    </div>
  )
}

function ErrorAlert(props: { class?: string }) {
  return (
    <Show when={syncError()}>
      <Alert variant="destructive" class={`pr-10 ${props.class ?? ''}`}>
        <AlertTitle>Sync failed</AlertTitle>
        <AlertDescription>{syncError()}</AlertDescription>
        <button class="absolute right-3 top-3 text-lg leading-none" aria-label="Dismiss" onClick={() => setSyncError(null)}>
          ×
        </button>
      </Alert>
    </Show>
  )
}

const ExercisePlaceholder = () => (
  <div class="flex flex-col gap-3">
    <div class="h-24 w-full animate-pulse rounded-lg bg-muted" />
    <div class="h-10 w-full animate-pulse rounded-lg bg-muted" />
    <p class="text-center text-xs text-muted-foreground">(the exercise goes here)</p>
  </div>
)

const EMPTY_TEXT = 'Not enough Guru+ vocabulary yet, keep reviewing.'

/* ---------------------------------------------------------------- A: Card */

/** A: a slim header with a gear popover; every state is one centered card. */
export function VariantA() {
  const [open, setOpen] = createSignal(false)
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-36">
      <header class="flex h-14 items-center justify-between">
        <span class="font-semibold">漢字 practice</span>
        <Show when={screen() !== 'key'}>
          <Popover open={open()} onOpenChange={setOpen} placement="bottom-end">
            <PopoverTrigger as={Button} variant="ghost" size="icon" aria-label="Settings">
              <Gear />
            </PopoverTrigger>
            <PopoverContent class="w-80">
              <SettingsActions onDone={() => setOpen(false)} />
            </PopoverContent>
          </Popover>
        </Show>
      </header>
      <ErrorAlert class="mb-4" />
      <Switch>
        <Match when={screen() === 'key'}>
          <Card>
            <CardHeader>
              <CardTitle>Connect WaniKani</CardTitle>
              <CardDescription>The app builds exercises from your Guru+ items.</CardDescription>
            </CardHeader>
            <CardContent>
              <KeyField onSave={() => startFirstRun()} />
            </CardContent>
          </Card>
        </Match>
        <Match when={screen() === 'syncing'}>
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Spinner /> Syncing known items
              </CardTitle>
              <CardDescription>First sync. Later syncs only fetch changes.</CardDescription>
            </CardHeader>
            <CardContent class="flex flex-col gap-2">
              <div class="h-2 overflow-hidden rounded-full bg-muted">
                <div class="h-full bg-primary transition-all" style={{ width: `${(progress() / TOTAL) * 100}%` }} />
              </div>
              <span class="text-sm tabular-nums text-muted-foreground">
                {fmt(progress())} / {fmt(TOTAL)} items
              </span>
            </CardContent>
          </Card>
        </Match>
        <Match when={screen() === 'empty'}>
          <Card>
            <CardHeader>
              <CardTitle>Almost there</CardTitle>
              <CardDescription>{EMPTY_TEXT}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{known.emptyWords} / 30 known words</Badge>
            </CardContent>
            <CardFooter>
              <Button class="w-full" disabled>
                Generate exercise
              </Button>
            </CardFooter>
          </Card>
        </Match>
        <Match when={screen() === 'ready'}>
          <ExercisePlaceholder />
        </Match>
      </Switch>
    </div>
  )
}

/* ---------------------------------------------------------- B: Thumb zone */

/** B: no cards. Big type up top, every action at the bottom under the thumb, settings in a drawer. */
export function VariantB() {
  const [open, setOpen] = createSignal(false)
  const Bottom = (p: { children: JSX.Element }) => (
    <div class="mt-auto flex flex-col gap-3 pb-36 pt-6">{p.children}</div>
  )
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col px-5">
      <Show when={screen() !== 'key'}>
        <Drawer open={open()} onOpenChange={setOpen}>
          <DrawerTrigger as={Button} variant="ghost" size="icon" class="fixed right-3 top-3 z-10" aria-label="Settings">
            <Gear />
          </DrawerTrigger>
          <DrawerContent>
            <div class="mx-auto w-full max-w-md px-5 pb-8">
              <DrawerHeader class="px-0">
                <DrawerTitle>Settings</DrawerTitle>
                <DrawerDescription>WaniKani key and known items</DrawerDescription>
              </DrawerHeader>
              <SettingsActions onDone={() => setOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </Show>
      <Switch>
        <Match when={screen() === 'key'}>
          <div class="pt-20">
            <div class="text-6xl font-bold text-primary">漢</div>
            <h1 class="mt-4 text-3xl font-bold leading-tight">Practice with the words you already know.</h1>
            <p class="mt-3 text-muted-foreground">Paste your WaniKani token to start.</p>
          </div>
          <Bottom>
            <KeyField onSave={() => startFirstRun()} />
          </Bottom>
        </Match>
        <Match when={screen() === 'syncing'}>
          <div class="flex flex-1 flex-col items-center justify-center gap-2 pb-36 text-center">
            <div class="text-7xl font-bold tabular-nums text-primary">{fmt(progress())}</div>
            <div class="text-muted-foreground">of {fmt(TOTAL)} known items downloaded</div>
            <Spinner class="mt-6 size-6 text-muted-foreground" />
          </div>
        </Match>
        <Match when={screen() === 'empty'}>
          <div class="pt-20">
            <div class="text-7xl font-bold tabular-nums text-muted-foreground">
              {known.emptyWords}
              <span class="text-3xl">/30</span>
            </div>
            <h1 class="mt-4 text-2xl font-bold">{EMPTY_TEXT}</h1>
          </div>
          <Bottom>
            <Button size="lg" class="w-full" disabled>
              Generate exercise
            </Button>
          </Bottom>
        </Match>
        <Match when={screen() === 'ready'}>
          <div class="pt-16">
            <ExercisePlaceholder />
          </div>
        </Match>
      </Switch>
      <Show when={syncError()}>
        <div class="fixed inset-x-3 bottom-36 z-20 mx-auto flex max-w-md items-start gap-3 rounded-xl bg-destructive p-3 text-sm text-destructive-foreground shadow-lg">
          <span class="flex-1">{syncError()}</span>
          <button class="text-lg leading-none" aria-label="Dismiss" onClick={() => setSyncError(null)}>
            ×
          </button>
        </div>
      </Show>
    </div>
  )
}

/* -------------------------------------------------------- C: Status strip */

/** C: a persistent status strip shows sync state and opens settings; the main area stays put. */
export function VariantC() {
  const [open, setOpen] = createSignal(false)
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col pb-36">
      <Show when={screen() !== 'key'}>
        <Popover open={open()} onOpenChange={setOpen} placement="bottom" sameWidth>
          <PopoverTrigger
            as="button"
            class="sticky top-0 z-10 flex w-full flex-col border-b bg-background/90 px-4 py-2 text-left text-xs backdrop-blur"
          >
            <div class="flex items-center gap-2">
              <Switch>
                <Match when={screen() === 'syncing'}>
                  <Spinner class="size-3.5" />
                  <span class="tabular-nums">
                    Syncing {fmt(progress())} / {fmt(TOTAL)}
                  </span>
                </Match>
                <Match when={refreshing()}>
                  <Spinner class="size-3.5" />
                  <span>Refreshing…</span>
                </Match>
                <Match when={syncError()}>
                  <span class="size-2 rounded-full bg-destructive" />
                  <span class="text-destructive">Sync failed, using stored items</span>
                </Match>
                <Match when={true}>
                  <span class="size-2 rounded-full bg-primary" />
                  <span>
                    {fmt(screen() === 'empty' ? known.emptyWords : known.words)} words ·{' '}
                    {fmt(screen() === 'empty' ? 41 : known.kanji)} kanji · {lastSync()}
                  </span>
                </Match>
              </Switch>
              <span class="ml-auto text-muted-foreground">⚙</span>
            </div>
            <Show when={screen() === 'syncing'}>
              <div class="absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-all" style={{ width: `${(progress() / TOTAL) * 100}%` }} />
            </Show>
          </PopoverTrigger>
          <PopoverContent>
            <SettingsActions onDone={() => setOpen(false)} />
          </PopoverContent>
        </Popover>
      </Show>
      <ErrorAlert class="mx-4 mt-3 w-auto" />
      <main class="flex flex-1 flex-col px-4 pt-6">
        <Switch>
          <Match when={screen() === 'key'}>
            <h1 class="text-xl font-semibold">Set up</h1>
            <ol class="mt-4 flex flex-col gap-4 text-sm">
              <li class="flex gap-3">
                <Badge class="h-6 shrink-0">1</Badge>
                <span>
                  In WaniKani, open <b>Settings → API Tokens</b> and make a token with no permissions (read-only).
                </span>
              </li>
              <li class="flex gap-3">
                <Badge class="h-6 shrink-0">2</Badge>
                <KeyField class="flex-1" onSave={() => startFirstRun()} />
              </li>
            </ol>
          </Match>
          <Match when={screen() === 'syncing'}>
            <ExercisePlaceholder />
          </Match>
          <Match when={screen() === 'empty'}>
            <div class="rounded-lg border border-dashed p-6 text-center">
              <p class="font-medium">{EMPTY_TEXT}</p>
              <p class="mt-2 text-sm text-muted-foreground">You need 30 known words. You have {known.emptyWords}.</p>
              <Button class="mt-4" disabled>
                Generate exercise
              </Button>
            </div>
          </Match>
          <Match when={screen() === 'ready'}>
            <ExercisePlaceholder />
          </Match>
        </Switch>
      </main>
    </div>
  )
}
