import { Match, Show, Switch } from 'solid-js'
import { error, loading, result } from '../state'

function formatError(e: unknown): string {
  if (e instanceof Error) {
    return `${e.name}: ${e.message}\n\n${e.stack ?? ''}`
  }
  try {
    return JSON.stringify(e, null, 2)
  } catch {
    return String(e)
  }
}

export default function ResultPanel() {
  return (
    <div class="flex h-full flex-col overflow-hidden bg-zinc-950">
      <div class="border-b border-zinc-800 px-4 py-3">
        <h2 class="text-sm font-semibold uppercase tracking-wider text-zinc-400">Result</h2>
      </div>
      <div class="flex-1 overflow-auto p-4">
        <Switch
          fallback={
            <p class="text-sm text-zinc-500">Run a method to see the response here.</p>
          }
        >
          <Match when={loading()}>
            <p class="text-sm text-purple-300">Loading…</p>
          </Match>
          <Match when={error()}>
            <Show when={error()}>
              {(e) => (
                <pre class="whitespace-pre-wrap font-mono text-sm leading-relaxed text-red-300">
                  {formatError(e())}
                </pre>
              )}
            </Show>
          </Match>
          <Match when={result() !== undefined}>
            <pre class="font-mono text-sm leading-relaxed text-zinc-200">
              {JSON.stringify(result(), null, 2)}
            </pre>
          </Match>
        </Switch>
      </div>
    </div>
  )
}
