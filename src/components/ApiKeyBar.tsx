import { apiKey, setApiKey } from '../state'

export default function ApiKeyBar() {
  return (
    <header class="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
      <div class="flex items-center gap-2">
        <span class="text-lg font-semibold text-zinc-100">WaniKani SDK Playground</span>
        <span class="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs font-medium text-purple-300">
          v0.2.0
        </span>
      </div>
      <div class="ml-auto flex w-full max-w-md items-center gap-2">
        <label for="apiKey" class="shrink-0 text-sm text-zinc-400">
          API key
        </label>
        <input
          id="apiKey"
          type="password"
          placeholder="paste your WaniKani API token"
          value={apiKey()}
          onInput={(e) => setApiKey(e.currentTarget.value)}
          class="w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 font-mono text-sm text-zinc-100 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
        />
      </div>
    </header>
  )
}
