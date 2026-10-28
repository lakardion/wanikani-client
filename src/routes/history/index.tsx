import { A } from '@solidjs/router'
import { createMemo, createResource, createSignal, For, Show, startTransition } from 'solid-js'
import { BackButton, fmtDate, FROM_APP, OutcomeBadge } from '~/components/History'
import { Section } from '~/components/ExerciseLoop'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import {
  exportHistory,
  getAll,
  importHistory,
  lastExportAt,
  passRate,
  pattern,
  recordingOn,
  stats,
  type HistoryRecord,
  type ImportResult,
} from '~/lib/history'

const IMPORT_TEXT: Record<Exclude<ImportResult['kind'], 'ok'>, string> = {
  invalid: 'This file is not a History export. Nothing was imported.',
  newer: 'This file comes from a newer version of the app. Reload the app, then import again. Nothing was imported.',
  failed: 'The browser could not save the imported Exercises. Nothing was imported.',
}

const importText = (r: ImportResult) =>
  r.kind === 'ok' ? `Imported ${r.imported}, skipped ${r.skipped} (already present).` : IMPORT_TEXT[r.kind]

const tabClass = (on: boolean) => `flex-1 rounded-md py-1.5 text-sm ${on ? 'bg-background shadow' : 'text-muted-foreground'}`

export default function History() {
  const [records, { refetch }] = createResource(async () =>
    (await getAll().catch(() => [])).sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)),
  )
  const count = () => records()?.length ?? 0
  const [tab, setTab] = createSignal<'list' | 'stats'>('list')
  const [menuOpen, setMenuOpen] = createSignal(false)
  const [result, setResult] = createSignal<ImportResult | null>(null)
  /** Outside the popover, so it stays mounted while the file picker is open. */
  let input!: HTMLInputElement
  async function onFile() {
    const file = input.files?.[0]
    input.value = ''
    if (!file) return
    setMenuOpen(false)
    setResult(await importHistory(file))
    void startTransition(refetch)
  }
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8">
      <header class="flex h-14 items-center justify-between">
        <BackButton href="/" label="Practice" />
        <Popover open={menuOpen()} onOpenChange={setMenuOpen} placement="bottom-end">
          <PopoverTrigger as={Button} variant="ghost" size="sm">
            Export / Import
          </PopoverTrigger>
          <PopoverContent class="w-72 text-sm">
            <div class="flex flex-col gap-2">
              <p class="text-xs text-muted-foreground">Last export: {lastExportAt() ? fmtDate(lastExportAt()!) : 'never'}</p>
              <div class="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm" disabled={!count()} onClick={() => void exportHistory()}>
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => input.click()}>
                  Import
                </Button>
              </div>
              <p class="text-xs text-muted-foreground">
                Export saves History to a file. Import adds the Exercises from a file; the ones already here are skipped.
              </p>
            </div>
          </PopoverContent>
        </Popover>
        <input ref={input} type="file" accept=".json,application/json" class="hidden" onChange={() => void onFile()} />
      </header>
      <div class="flex flex-col gap-3">
        <Show when={result()}>
          {(r) => (
            <Alert variant={r().kind === 'ok' ? 'default' : 'destructive'} class="pr-10 text-left">
              <AlertDescription>{importText(r())}</AlertDescription>
              <button class="absolute right-3 top-3 text-lg leading-none" aria-label="Dismiss" onClick={() => setResult(null)}>
                ×
              </button>
            </Alert>
          )}
        </Show>
        <Show when={!recordingOn() && count()}>
          <p class="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">History is off. New Exercises are not recorded.</p>
        </Show>
        <div class="flex rounded-lg bg-muted p-1">
          <button class={tabClass(tab() === 'list')} onClick={() => setTab('list')}>
            Exercises ({count()})
          </button>
          <button class={tabClass(tab() === 'stats')} onClick={() => setTab('stats')}>
            Stats
          </button>
        </div>
        <Show
          when={count()}
          fallback={
            <div class="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
              <p>{recordingOn() ? 'No Exercises yet.' : 'History is off.'}</p>
              <p>You can import an export from another device.</p>
            </div>
          }
        >
          <Show when={tab() === 'list'} fallback={<Stats records={records()!} />}>
            <div>
              <For each={records()}>
                {(r) => (
                  <A href={`/history/${r.id}`} state={FROM_APP} class="flex w-full items-center gap-3 border-b px-1 py-3">
                    <div class="min-w-0 flex-1">
                      <p lang="ja" class="truncate">
                        {r.exercise.japanese}
                      </p>
                      <p class="truncate text-xs text-muted-foreground">
                        <span lang="ja">{pattern(r.exercise.grammarId)}</span> · {fmtDate(r.finishedAt)}
                      </p>
                    </div>
                    <OutcomeBadge outcome={r.outcome} />
                  </A>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  )
}

function Stats(props: { records: HistoryRecord[] }) {
  const s = createMemo(() => stats(props.records))
  return (
    <div class="flex flex-col gap-6">
      <div class="grid grid-cols-[2fr_1fr_1fr] gap-2">
        <div class="row-span-2 flex flex-col justify-end rounded-2xl bg-primary p-4 text-primary-foreground">
          <span class="text-4xl tabular-nums">{passRate(s().overall)}%</span>
          <span class="text-xs opacity-80">passed</span>
        </div>
        <div class="col-span-2 rounded-2xl bg-muted p-3">
          <span class="text-2xl tabular-nums">{s().overall.done}</span> <span class="text-xs text-muted-foreground">done</span>
        </div>
        <div class="col-span-2 rounded-2xl bg-muted p-3">
          <span class="text-2xl tabular-nums">{s().overall.gaveUp}</span>{' '}
          <span class="text-xs text-muted-foreground">gave up</span>
        </div>
      </div>
      <Section title="Grammar points, weakest first">
        <For each={s().points}>
          {(g) => (
            <div class="flex flex-col gap-1 py-2">
              <div class="flex items-center justify-between gap-3 text-sm">
                <span lang="ja">{g.pattern}</span>
                <span class="shrink-0 tabular-nums text-muted-foreground">
                  {passRate(g)}% of {g.done} · {g.gaveUp} gave up
                </span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-muted">
                <div class="h-full bg-primary" style={{ width: `${passRate(g)}%` }} />
              </div>
            </div>
          )}
        </For>
      </Section>
    </div>
  )
}
