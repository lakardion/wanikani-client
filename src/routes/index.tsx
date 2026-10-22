import { createSignal, Match, onMount, Show, Switch } from 'solid-js'
import { WanikaniApiError } from 'wanikani-sdk'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { Spinner } from '~/components/ui/spinner'
import { TextField, TextFieldDescription, TextFieldInput, TextFieldLabel } from '~/components/ui/text-field'
import { client } from '~/lib/client'
import {
  clearKnownItems,
  countKnown,
  loadKnownItems,
  MIN_KNOWN_WORDS,
  saveKnownItems,
  syncKnownItems,
  type Progress,
} from '~/lib/known-items'
import { apiKey, setApiKey } from '~/state'

const KEY_NOTE = 'Use a read-only token. It is stored only in this browser. If it is exposed, regenerate it in WaniKani settings.'
const EMPTY_TEXT = 'Not enough Guru+ vocabulary yet, keep reviewing.'

const [knownItems, setKnownItems] = createSignal(loadKnownItems())
const [firstRun, setFirstRun] = createSignal<Progress | null>(null)
const [refreshing, setRefreshing] = createSignal(false)
const [syncError, setSyncError] = createSignal<string | null>(null)
/** Bumped by every key change so a sync that started under the old key drops its result. */
let syncRun = 0

const busy = () => firstRun() !== null || refreshing()
const counts = () => countKnown(knownItems())

async function runSync() {
  const c = client()
  if (!c || busy()) return
  const run = ++syncRun
  const stored = knownItems()
  setSyncError(null)
  if (stored) setRefreshing(true)
  else setFirstRun({ done: 0, total: 0 })
  try {
    const next = await syncKnownItems(c, stored, (p) => run === syncRun && !stored && setFirstRun(p))
    if (run !== syncRun) return
    saveKnownItems(next)
    setKnownItems(next)
  } catch (e) {
    if (run !== syncRun) return
    if (e instanceof WanikaniApiError && e.status === 401) changeKey('')
    else setSyncError(e instanceof Error ? e.message : String(e))
  } finally {
    if (run === syncRun) {
      setFirstRun(null)
      setRefreshing(false)
    }
  }
}

function changeKey(value: string) {
  syncRun++
  setFirstRun(null)
  setRefreshing(false)
  clearKnownItems()
  setKnownItems(null)
  setApiKey(value)
  if (value) void runSync()
}

function rebuild() {
  clearKnownItems()
  setKnownItems(null)
  void runSync()
}

const fmt = (n: number) => n.toLocaleString('en-US')

/** The watermark is the sync start minus 10 minutes. */
const lastSync = () => {
  const w = knownItems()?.watermark
  return w ? new Date(Date.parse(w) + 10 * 60 * 1000).toLocaleString() : 'never'
}

function KeyForm(props: { onSave?: () => void }) {
  const [value, setValue] = createSignal('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        props.onSave?.()
        changeKey(value().trim())
      }}
    >
      <TextField value={value()} onChange={setValue}>
        <TextFieldLabel>WaniKani API token</TextFieldLabel>
        <TextFieldInput type="password" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" autocomplete="off" />
        <TextFieldDescription>{KEY_NOTE}</TextFieldDescription>
      </TextField>
      <Button type="submit" class="mt-4 w-full" disabled={!value().trim()}>
        Save and sync
      </Button>
    </form>
  )
}

function Settings(props: { onDone: () => void }) {
  const [changing, setChanging] = createSignal(false)
  return (
    <div class="flex flex-col gap-3 text-sm">
      <div class="text-muted-foreground">
        {fmt(counts().words)} known words · {fmt(counts().kanji)} known kanji
        <br />
        Last sync {lastSync()}
      </div>
      <div class="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" disabled={busy()} onClick={() => void runSync()}>
          <Show when={refreshing()} fallback="Refresh">
            <Spinner class="size-4" />
          </Show>
        </Button>
        <Button variant="outline" size="sm" disabled={busy()} onClick={() => (props.onDone(), rebuild())}>
          Rebuild
        </Button>
      </div>
      <p class="text-xs text-muted-foreground">
        Rebuild deletes the stored items and downloads them again. Use it after WaniKani edits a subject.
      </p>
      <hr />
      <Show
        when={changing()}
        fallback={
          <div class="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setChanging(true)}>
              Change key
            </Button>
            <Button variant="destructive" size="sm" onClick={() => (props.onDone(), changeKey(''))}>
              Clear key
            </Button>
          </div>
        }
      >
        <KeyForm onSave={props.onDone} />
      </Show>
      <p class="text-xs text-muted-foreground">Changing or clearing the key also deletes the stored items.</p>
    </div>
  )
}

const Gear = () => (
  <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

export default function Home() {
  const [open, setOpen] = createSignal(false)
  onMount(() => void runSync())
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8">
      <header class="flex h-14 items-center justify-between">
        <span class="font-semibold">漢字 practice</span>
        <Show when={apiKey()}>
          <Popover open={open()} onOpenChange={setOpen} placement="bottom-end">
            <PopoverTrigger as={Button} variant="ghost" size="icon" aria-label="Settings">
              <Gear />
            </PopoverTrigger>
            <PopoverContent class="w-80">
              <Settings onDone={() => setOpen(false)} />
            </PopoverContent>
          </Popover>
        </Show>
      </header>
      <Show when={syncError()}>
        <Alert variant="destructive" class="mb-4 pr-10">
          <AlertTitle>Sync failed</AlertTitle>
          <AlertDescription>{syncError()}</AlertDescription>
          <button class="absolute right-3 top-3 text-lg leading-none" aria-label="Dismiss" onClick={() => setSyncError(null)}>
            ×
          </button>
        </Alert>
      </Show>
      <Switch>
        <Match when={!apiKey()}>
          <Card>
            <CardHeader>
              <CardTitle>Connect WaniKani</CardTitle>
              <CardDescription>The app builds exercises from your Guru+ items.</CardDescription>
            </CardHeader>
            <CardContent>
              <KeyForm />
            </CardContent>
          </Card>
        </Match>
        <Match when={firstRun()}>
          {(p) => (
            <Card>
              <CardHeader>
                <CardTitle class="flex items-center gap-2">
                  <Spinner /> Syncing known items
                </CardTitle>
                <CardDescription>First sync. Later syncs only fetch changes.</CardDescription>
              </CardHeader>
              <CardContent class="flex flex-col gap-2">
                <div class="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    class="h-full bg-primary transition-all"
                    style={{ width: `${p().total ? (p().done / p().total) * 100 : 0}%` }}
                  />
                </div>
                <span class="text-sm tabular-nums text-muted-foreground">
                  {fmt(p().done)} / {fmt(p().total)} items
                </span>
              </CardContent>
            </Card>
          )}
        </Match>
        <Match when={!knownItems()}>
          <Card>
            <CardHeader>
              <CardTitle>No known items yet</CardTitle>
              <CardDescription>The first sync did not finish.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button class="w-full" onClick={() => void runSync()}>
                Retry sync
              </Button>
            </CardFooter>
          </Card>
        </Match>
        <Match when={counts().words < MIN_KNOWN_WORDS}>
          <Card>
            <CardHeader>
              <CardTitle>Almost there</CardTitle>
              <CardDescription>{EMPTY_TEXT}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">
                {counts().words} / {MIN_KNOWN_WORDS} known words
              </Badge>
            </CardContent>
            <CardFooter>
              <Button class="w-full" disabled>
                Generate exercise
              </Button>
            </CardFooter>
          </Card>
        </Match>
        <Match when={true}>
          <p class="py-12 text-center text-sm text-muted-foreground">
            {fmt(counts().words)} known words and {fmt(counts().kanji)} known kanji are ready. Exercises come next.
          </p>
        </Match>
      </Switch>
    </div>
  )
}
