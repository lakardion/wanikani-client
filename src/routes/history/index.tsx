import { A } from '@solidjs/router'
import { createResource, For, Show } from 'solid-js'
import { BackButton, fmtDate, FROM_APP, OutcomeBadge } from '~/components/History'
import { GRAMMAR } from '~/lib/grammar'
import { getAll, recordingOn } from '~/lib/history'

const pattern = (id: string) => GRAMMAR.find((g) => g.id === id)?.pattern ?? id

export default function History() {
  const [records] = createResource(async () =>
    (await getAll().catch(() => [])).sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)),
  )
  const count = () => records()?.length ?? 0
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8">
      <header class="flex h-14 items-center">
        <BackButton href="/" label="Practice" />
      </header>
      <div class="flex flex-col gap-3">
        <Show when={!recordingOn() && count()}>
          <p class="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">History is off. New Exercises are not recorded.</p>
        </Show>
        <div class="flex rounded-lg bg-muted p-1">
          <span class="flex-1 rounded-md bg-background py-1.5 text-center text-sm shadow">Exercises ({count()})</span>
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
      </div>
    </div>
  )
}
