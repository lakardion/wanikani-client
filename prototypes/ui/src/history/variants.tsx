/** PROTOTYPE: three structurally different takes on the History screens. Fake data only. */
import { createSignal, For, Match, Show, Switch, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '~/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  deleteHistory, exportFile, fmtDate, fmtDay, grammarLabel, GRAMMAR, importFile, importResult, importText, lastExportAt, pct,
  persisted, recordingOn, records, setImportResult, setRecordingOn, setReminderSnoozedAt, setUnsaved, setWarningDismissed,
  showReminder, sinceExport, stats, unsaved, warningDismissed, type HistoryRecord, type Outcome,
} from './fake'

/* ---------- shared shell: the parts every variant keeps ---------- */

const Gear = () => (
  <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
  </svg>
)
const Clock = () => (
  <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5M12 7v5l3 2" />
  </svg>
)
const Back = (props: { onClick: () => void; label?: string }) => (
  <Button variant="ghost" size="sm" class="-ml-2" onClick={props.onClick}>
    ← {props.label ?? 'Back'}
  </Button>
)

const OUTCOME: Record<Outcome, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pass: { label: 'Pass', variant: 'default' },
  fail: { label: 'Not passed', variant: 'secondary' },
  give_up: { label: 'Gave up', variant: 'outline' },
}
const OutcomeBadge = (props: { outcome: Outcome }) => (
  <Badge variant={OUTCOME[props.outcome].variant} class="shrink-0">{OUTCOME[props.outcome].label}</Badge>
)

const Section = (props: { title: string; children: JSX.Element }) => (
  <section class="flex flex-col gap-2">
    <h3 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{props.title}</h3>
    {props.children}
  </section>
)

function Toggle(props: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label class="flex items-center justify-between gap-2">
      <span>{props.label}</span>
      <button
        role="switch"
        aria-checked={props.checked}
        class={`relative h-6 w-10 rounded-full transition-colors ${props.checked ? 'bg-primary' : 'bg-muted'}`}
        onClick={() => props.onChange(!props.checked)}
      >
        <span class={`absolute top-0.5 size-5 rounded-full bg-background shadow transition-all ${props.checked ? 'left-[1.125rem]' : 'left-0.5'}`} />
      </button>
    </label>
  )
}

/** Delete history with an inline confirm step. */
function DeleteButton() {
  const [confirm, setConfirm] = createSignal(false)
  return (
    <Show
      when={confirm()}
      fallback={
        <Button variant="destructive" size="sm" disabled={!records().length} onClick={() => setConfirm(true)}>
          Delete history
        </Button>
      }
    >
      <div class="flex flex-col gap-2 rounded-md border border-destructive/40 p-2">
        <p class="text-xs">Delete {records().length} Exercises from this browser? Export first to keep a copy. This cannot be undone.</p>
        <div class="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirm(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={() => (deleteHistory(), setConfirm(false))}>Delete</Button>
        </div>
      </div>
    </Show>
  )
}

const ImportResultLine = () => (
  <Show when={importResult()}>
    {(r) => (
      <Alert variant={r().kind === 'ok' ? 'default' : 'destructive'} class="pr-8 text-left">
        <AlertDescription>{importText(r())}</AlertDescription>
        <button class="absolute right-3 top-3 leading-none" aria-label="Dismiss" onClick={() => setImportResult(null)}>×</button>
      </Alert>
    )}
  </Show>
)

const lastExportText = () => (lastExportAt() ? fmtDate(lastExportAt()!) : 'never')

/** Export and import buttons; `inline` drops the explanatory text. */
function DataButtons(props: { inline?: boolean }) {
  return (
    <div class="flex flex-col gap-2">
      <div class="grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" disabled={!records().length} onClick={exportFile}>Export</Button>
        <Button variant="outline" size="sm" onClick={importFile}>Import</Button>
      </div>
      <Show when={!props.inline}>
        <p class="text-xs text-muted-foreground">
          Export saves a file. Import a file on another device to continue there. Import adds new Exercises and skips the ones already here.
        </p>
      </Show>
    </div>
  )
}

/** The History block of the settings popover. `withData` adds export and import. */
function HistorySettings(props: { withData?: boolean }) {
  return (
    <div class="flex flex-col gap-3">
      <h4 class="text-xs font-medium uppercase tracking-wide text-muted-foreground">History</h4>
      <Toggle label="Record History" checked={recordingOn()} onChange={setRecordingOn} />
      <Show when={!recordingOn()}>
        <p class="text-xs text-muted-foreground">New Exercises are not recorded. The {records().length} saved ones stay.</p>
      </Show>
      <div class="text-xs text-muted-foreground">
        {records().length} Exercises · Storage: {persisted() ? 'persistent' : 'not persistent'}
        <br />
        Last export: {lastExportText()}
      </div>
      <Show when={props.withData}>
        <DataButtons inline />
        <ImportResultLine />
      </Show>
      <DeleteButton />
    </div>
  )
}

function SettingsPopover(props: { withData?: boolean }) {
  return (
    <Popover placement="bottom-end">
      <PopoverTrigger as={Button} variant="ghost" size="icon" aria-label="Settings">
        <Gear />
      </PopoverTrigger>
      <PopoverContent class="w-80">
        <div class="flex flex-col gap-3 text-sm">
          <div class="text-muted-foreground">
            1,204 known words · 812 known kanji
            <br />
            Last sync 24/10/2026, 14:02
          </div>
          <p class="text-xs text-muted-foreground">(Refresh, Rebuild, Change key and Clear key stay as they are.)</p>
          <hr />
          <HistorySettings withData={props.withData} />
        </div>
      </PopoverContent>
    </Popover>
  )
}

function Header(props: { extra?: JSX.Element; withData?: boolean }) {
  return (
    <header class="flex h-14 items-center justify-between gap-2">
      <span class="font-semibold">漢字 practice</span>
      <div class="flex items-center gap-1">
        {props.extra}
        <SettingsPopover withData={props.withData} />
      </div>
    </header>
  )
}

function FirstOpenWarning() {
  return (
    <Show when={!warningDismissed()}>
      <Alert class="mb-4 text-left">
        <AlertTitle>History is on</AlertTitle>
        <AlertDescription class="flex flex-col gap-2">
          <span>
            Finished Exercises are saved only in this browser. Clearing site data deletes them. Export from History to keep a copy, or turn History off in
            settings.
          </span>
          <Button size="sm" class="w-fit" onClick={() => setWarningDismissed(true)}>Got it</Button>
        </AlertDescription>
      </Alert>
    </Show>
  )
}

function SaveFailed() {
  return (
    <Show when={unsaved()}>
      <Alert variant="destructive" class="mb-4 pr-8 text-left">
        <AlertDescription>This Exercise was not saved to History. The app tries again after the next one.</AlertDescription>
        <button class="absolute right-3 top-3 leading-none" aria-label="Dismiss" onClick={() => setUnsaved(0)}>×</button>
      </Alert>
    </Show>
  )
}

/** The explanation step of the loop, cut down to what History touches: the reminder line above Next. */
function LoopExplanation(props: { onExport?: () => void }) {
  return (
    <div class="flex flex-1 flex-col">
      <div class="flex justify-center">
        <Badge variant="outline" class="tabular-nums">✓ 3 · 5 done</Badge>
      </div>
      <p lang="ja" class="py-8 text-center text-3xl leading-relaxed">宿題をしてから、友達と公園で遊びました。</p>
      <div class="mt-auto flex flex-col gap-3 rounded-t-2xl border bg-card p-4 shadow-lg">
        <Badge class="w-fit">Pass · 88</Badge>
        <p class="text-sm">After doing my homework, I played in the park with a friend.</p>
        <p class="text-xs text-muted-foreground">(Breakdown, Grammar and Example as today.)</p>
        <Show when={showReminder()}>
          <div class="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2 text-xs">
            <span>{sinceExport()} Exercises since your last export.</span>
            <span class="flex shrink-0 items-center gap-3">
              <button class="font-medium underline" onClick={() => (props.onExport ?? exportFile)()}>Export</button>
              <button aria-label="Dismiss" onClick={() => setReminderSnoozedAt(sinceExport())}>×</button>
            </span>
          </div>
        </Show>
        <Button class="w-full">Next</Button>
      </div>
    </div>
  )
}

function Attempts(props: { record: HistoryRecord }) {
  return (
    <ol class="flex flex-col gap-2">
      <For each={props.record.attempts}>
        {(a, i) => (
          <li class="rounded-lg bg-muted px-3 py-2 text-sm">
            <div class="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>Attempt {i() + 1}</span>
              <span>{'giveUp' in a ? 'Gave up' : `${a.pass ? 'Pass' : 'Not passed'} · ${a.score}`}</span>
            </div>
            <p class="mt-1">{a.answer.trim() ? `“${a.answer}”` : <span class="text-muted-foreground">(empty)</span>}</p>
            <Show when={!('giveUp' in a) && a}>{(g) => <p class="mt-1 text-xs text-muted-foreground">{(g() as { feedback: string }).feedback}</p>}</Show>
          </li>
        )}
      </For>
    </ol>
  )
}

/** The Explanation of a past Exercise, re-opened with its Attempts. */
function RecordBody(props: { record: HistoryRecord }) {
  const g = () => GRAMMAR[props.record.exercise.grammarId]
  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <div class="flex items-center justify-between text-xs text-muted-foreground">
          <span>{fmtDate(props.record.finishedAt)}</span>
          <OutcomeBadge outcome={props.record.outcome} />
        </div>
        <p lang="ja" class="text-2xl leading-relaxed">{props.record.exercise.japanese}</p>
        <p lang="ja" class="text-xs text-muted-foreground">{props.record.exercise.reading}</p>
        <p class="text-sm">{props.record.exercise.english}</p>
      </div>
      <Section title="Your attempts">
        <Attempts record={props.record} />
      </Section>
      <Section title="Grammar">
        <p class="text-sm">
          <span lang="ja" class="font-semibold">{grammarLabel(props.record.exercise.grammarId)}</span> {g()?.meaning ?? ''}
        </p>
      </Section>
      <p class="text-xs text-muted-foreground">(Breakdown and Example as in the Explanation.)</p>
    </div>
  )
}

function Row(props: { record: HistoryRecord; onClick: () => void; hideGrammar?: boolean }) {
  return (
    <button class="flex w-full items-center gap-3 border-b px-1 py-3 text-left" onClick={props.onClick}>
      <div class="min-w-0 flex-1">
        <p lang="ja" class="truncate">{props.record.exercise.japanese}</p>
        <p class="truncate text-xs text-muted-foreground">
          <Show when={!props.hideGrammar}>
            <span lang="ja">{grammarLabel(props.record.exercise.grammarId)}</span> ·{' '}
          </Show>
          {fmtDate(props.record.finishedAt)}
        </p>
      </div>
      <OutcomeBadge outcome={props.record.outcome} />
    </button>
  )
}

const EmptyHistory = () => (
  <div class="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
    <Show when={recordingOn()} fallback={<p>History is off. Turn it on in settings to record finished Exercises.</p>}>
      <p>No Exercises yet. Finished Exercises show here.</p>
    </Show>
    <p>Have an export from another device? Import it.</p>
  </div>
)

const RecordingOffNote = () => (
  <Show when={!recordingOn() && records().length}>
    <p class="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">History is off. New Exercises are not recorded.</p>
  </Show>
)

const Page = (props: { children: JSX.Element }) => <div class="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-40">{props.children}</div>

/* ---------- A: header button, History page with tabs ---------- */

export function VariantA() {
  const [view, setView] = createSignal<'home' | 'history'>('home')
  const [tab, setTab] = createSignal<'list' | 'stats'>('list')
  const [open, setOpen] = createSignal<HistoryRecord | null>(null)
  const tabClass = (on: boolean) => `flex-1 rounded-md py-1.5 text-sm ${on ? 'bg-background shadow' : 'text-muted-foreground'}`
  return (
    <Page>
      <Switch>
        <Match when={open()}>
          {(r) => (
            <>
              <header class="flex h-14 items-center"><Back label="History" onClick={() => setOpen(null)} /></header>
              <RecordBody record={r()} />
            </>
          )}
        </Match>
        <Match when={view() === 'history'}>
          <header class="flex h-14 items-center justify-between">
            <Back label="Practice" onClick={() => setView('home')} />
            <Popover placement="bottom-end">
              <PopoverTrigger as={Button} variant="ghost" size="sm">Export / Import</PopoverTrigger>
              <PopoverContent class="w-72 text-sm">
                <div class="flex flex-col gap-2">
                  <p class="text-xs text-muted-foreground">Last export: {lastExportText()}</p>
                  <DataButtons />
                </div>
              </PopoverContent>
            </Popover>
          </header>
          <div class="flex flex-col gap-3">
            <ImportResultLine />
            <RecordingOffNote />
            <div class="flex rounded-lg bg-muted p-1">
              <button class={tabClass(tab() === 'list')} onClick={() => setTab('list')}>Exercises ({records().length})</button>
              <button class={tabClass(tab() === 'stats')} onClick={() => setTab('stats')}>Stats</button>
            </div>
            <Show when={records().length} fallback={<EmptyHistory />}>
              <Show when={tab() === 'list'} fallback={<StatsOverview />}>
                <div>
                  <For each={records()}>{(r) => <Row record={r} onClick={() => setOpen(r)} />}</For>
                </div>
              </Show>
            </Show>
          </div>
        </Match>
        <Match when={view() === 'home'}>
          <Header
            extra={
              <Button variant="ghost" size="icon" aria-label="History" onClick={() => setView('history')}>
                <Clock />
              </Button>
            }
          />
          <FirstOpenWarning />
          <SaveFailed />
          <LoopExplanation />
        </Match>
      </Switch>
    </Page>
  )
}

/** Big totals, then Grammar points weakest first. Rows are tappable only when `onPoint` is set. */
function StatsOverview(props: { onPoint?: (id: string) => void }) {
  const s = () => stats().overall
  const points = () => stats().per.sort((a, b) => pct(a) - pct(b))
  return (
    <div class="flex flex-col gap-6">
      <div class="grid grid-cols-[2fr_1fr_1fr] gap-2">
        <div class="row-span-2 flex flex-col justify-end rounded-2xl bg-primary p-4 text-primary-foreground">
          <span class="text-4xl tabular-nums">{pct(s())}%</span>
          <span class="text-xs opacity-80">pass rate</span>
        </div>
        <div class="col-span-2 rounded-2xl bg-muted p-3"><span class="text-2xl tabular-nums">{s().done}</span> <span class="text-xs text-muted-foreground">done</span></div>
        <div class="col-span-2 rounded-2xl bg-muted p-3"><span class="text-2xl tabular-nums">{s().gaveUp}</span> <span class="text-xs text-muted-foreground">gave up</span></div>
      </div>
      <Section title="Grammar points, weakest first">
        <For each={points()}>
          {(g) => (
            <Dynamic component={props.onPoint ? 'button' : 'div'} class="flex flex-col gap-1 py-2 text-left" onClick={() => props.onPoint?.(g.id)}>
              <div class="flex items-center justify-between text-sm">
                <span lang="ja">{grammarLabel(g.id)}</span>
                <span class="tabular-nums text-muted-foreground">{pct(g)}% of {g.done} · {g.gaveUp} gave up{props.onPoint ? ' ›' : ''}</span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-muted">
                <div class="h-full bg-primary" style={{ width: `${pct(g)}%` }} />
              </div>
            </Dynamic>
          )}
        </For>
      </Section>
    </div>
  )
}

/* ---------- B: the count badge opens a History drawer over the loop ---------- */

export function VariantB() {
  const [open, setOpen] = createSignal(false)
  const [expanded, setExpanded] = createSignal<string | null>(null)
  const days = () => {
    const out: { day: string; items: HistoryRecord[] }[] = []
    for (const r of records()) {
      const d = fmtDay(r.finishedAt)
      if (out.at(-1)?.day !== d) out.push({ day: d, items: [] })
      out.at(-1)!.items.push(r)
    }
    return out
  }
  const s = () => stats().overall
  return (
    <Page>
      <Header withData />
      <FirstOpenWarning />
      <SaveFailed />
      <div class="flex justify-center pb-2">
        <Button variant="link" size="sm" onClick={() => setOpen(true)}>History · {records().length} Exercises ›</Button>
      </div>
      <LoopExplanation />
      <Drawer open={open()} onOpenChange={setOpen}>
        <DrawerContent class="h-[92dvh]">
          <DrawerHeader class="text-left">
            <DrawerTitle>History</DrawerTitle>
            <p class="text-sm tabular-nums text-muted-foreground">
              {s().done} done · {pct(s())}% passed · {s().gaveUp} gave up
            </p>
          </DrawerHeader>
          <div class="flex flex-col gap-3 overflow-y-auto px-4 pb-8">
            <RecordingOffNote />
            <Show when={records().length} fallback={<EmptyHistory />}>
              <For each={days()}>
                {(d) => (
                  <section>
                    <h3 class="sticky top-0 bg-background py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{d.day}</h3>
                    <For each={d.items}>
                      {(r) => (
                        <div class="border-b">
                          <button class="flex w-full items-center gap-3 py-3 text-left" onClick={() => setExpanded(expanded() === r.id ? null : r.id)}>
                            <span class="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">
                              {new Date(r.finishedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span lang="ja" class="min-w-0 flex-1 truncate">{r.exercise.japanese}</span>
                            <OutcomeBadge outcome={r.outcome} />
                          </button>
                          <Show when={expanded() === r.id}>
                            <div class="pb-4"><RecordBody record={r} /></div>
                          </Show>
                        </div>
                      )}
                    </For>
                  </section>
                )}
              </For>
              <p class="pt-2 text-xs text-muted-foreground">Per Grammar point stats and export live in settings.</p>
              <StatsByGrammarCompact />
            </Show>
          </div>
        </DrawerContent>
      </Drawer>
    </Page>
  )
}

function StatsByGrammarCompact() {
  return (
    <Section title="By Grammar point">
      <For each={stats().per.sort((a, b) => b.done - a.done)}>
        {(g) => (
          <div class="flex items-center justify-between text-sm">
            <span lang="ja">{grammarLabel(g.id)}</span>
            <span class="tabular-nums text-muted-foreground">{g.done} · {pct(g)}% · {g.gaveUp} gave up</span>
          </div>
        )}
      </For>
    </Section>
  )
}

/* ---------- C: stats first, drill down by Grammar point ---------- */

export function VariantC() {
  const [view, setView] = createSignal<'home' | 'history'>('home')
  const [point, setPoint] = createSignal<string | null>(null)
  const [open, setOpen] = createSignal<HistoryRecord | null>(null)
  return (
    <Page>
      <Switch>
        <Match when={open()}>
          {(r) => (
            <>
              <header class="flex h-14 items-center"><Back label={point() ? grammarLabel(point()!) : 'History'} onClick={() => setOpen(null)} /></header>
              <RecordBody record={r()} />
            </>
          )}
        </Match>
        <Match when={point()}>
          {(id) => {
            const st = () => stats().per.find((p) => p.id === id())
            return (
              <>
                <header class="flex h-14 items-center"><Back label="History" onClick={() => setPoint(null)} /></header>
                <h2 lang="ja" class="text-xl font-semibold">{grammarLabel(id())}</h2>
                <p class="text-sm text-muted-foreground">
                  {GRAMMAR[id()]?.meaning ?? 'Not in the current list'} · {st()?.done} done · {st() ? pct(st()!) : 0}% passed · {st()?.gaveUp} gave up
                </p>
                <div class="mt-3">
                  <For each={records().filter((r) => r.exercise.grammarId === id())}>{(r) => <Row record={r} hideGrammar onClick={() => setOpen(r)} />}</For>
                </div>
              </>
            )
          }}
        </Match>
        <Match when={view() === 'history'}>
          <header class="flex h-14 items-center"><Back label="Practice" onClick={() => setView('home')} /></header>
          <div class="flex flex-col gap-6">
            <RecordingOffNote />
            <Show when={records().length} fallback={<EmptyHistory />}>
              <StatsOverview onPoint={setPoint} />
            </Show>
            <Section title="Your data">
              <p class="text-xs text-muted-foreground">
                Saved only in this browser · storage {persisted() ? 'persistent' : 'not persistent'} · last export {lastExportText()}
              </p>
              <DataButtons />
              <ImportResultLine />
            </Section>
          </div>
        </Match>
        <Match when={view() === 'home'}>
          <Header extra={<Button variant="ghost" size="sm" onClick={() => setView('history')}>History</Button>} />
          <FirstOpenWarning />
          <SaveFailed />
          <LoopExplanation onExport={() => setView('history')} />
        </Match>
      </Switch>
    </Page>
  )
}
