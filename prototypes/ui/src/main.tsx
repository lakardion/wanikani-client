/** PROTOTYPE: three setup-screen variants on one page, switched by ?variant=, ?screen=, ?palette=, ?theme=. */
import { createEffect, createSignal, For, onCleanup } from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import './index.css'
import { SCREENS, setScreen, setSyncError, screen, startFirstRun, stopSync, syncError, SYNC_ERROR, type Screen } from './fake'
import { VariantA, VariantB, VariantC } from './variants'

const VARIANTS = [
  { key: 'A', name: 'Card', C: VariantA },
  { key: 'B', name: 'Thumb zone', C: VariantB },
  { key: 'C', name: 'Status strip', C: VariantC },
]
const PALETTES = ['matcha', 'sumi', 'ai']

const params = new URLSearchParams(location.search)
const [variant, setVariant] = createSignal(params.get('variant') ?? 'A')
const [palette, setPalette] = createSignal(params.get('palette') ?? 'matcha')
const [theme, setTheme] = createSignal(params.get('theme') ?? 'light')
const initial = params.get('screen') as Screen | null
if (initial === 'syncing') startFirstRun()
else if (initial) setScreen(initial)

createEffect(() => {
  const p = new URLSearchParams({ variant: variant(), screen: screen(), palette: palette(), theme: theme() })
  history.replaceState(null, '', `?${p}`)
  document.documentElement.dataset.palette = palette()
  document.documentElement.dataset.kbTheme = theme()
})

function cycle<T>(list: T[], current: T, step: number) {
  return list[(list.indexOf(current) + step + list.length) % list.length]
}

function Switcher() {
  const keys = VARIANTS.map((v) => v.key)
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement
    if (t.closest('input, textarea, [contenteditable]')) return
    if (e.key === 'ArrowLeft') setVariant(cycle(keys, variant(), -1))
    if (e.key === 'ArrowRight') setVariant(cycle(keys, variant(), 1))
  }
  window.addEventListener('keydown', onKey)
  onCleanup(() => window.removeEventListener('keydown', onKey))
  const chip = 'rounded-full px-2 py-1 text-[11px] leading-none'
  return (
    <div class="fixed left-1/2 bottom-2 z-[100] flex max-w-[calc(100vw-1rem)] -translate-x-1/2 flex-col gap-1 rounded-2xl bg-black/85 p-2 font-mono text-white shadow-xl">
      <div class="flex items-center justify-between gap-2 text-xs">
        <button class="px-2" onClick={() => setVariant(cycle(keys, variant(), -1))}>←</button>
        <span>
          {variant()} ({VARIANTS.find((v) => v.key === variant())?.name})
        </span>
        <button class="px-2" onClick={() => setVariant(cycle(keys, variant(), 1))}>→</button>
      </div>
      <div class="flex flex-wrap justify-center gap-1">
        <For each={SCREENS}>
          {(s) => (
            <button
              class={`${chip} ${screen() === s ? 'bg-white text-black' : 'bg-white/15'}`}
              onClick={() => (s === 'syncing' ? startFirstRun() : (stopSync(), setScreen(s)))}
            >
              {s}
            </button>
          )}
        </For>
        <button
          class={`${chip} ${syncError() ? 'bg-red-400 text-black' : 'bg-white/15'}`}
          onClick={() => setSyncError(syncError() ? null : SYNC_ERROR)}
        >
          error
        </button>
      </div>
      <div class="flex flex-wrap justify-center gap-1">
        <For each={PALETTES}>
          {(p) => (
            <button class={`${chip} ${palette() === p ? 'bg-white text-black' : 'bg-white/15'}`} onClick={() => setPalette(p)}>
              {p}
            </button>
          )}
        </For>
        <button class={`${chip} bg-white/15`} onClick={() => setTheme(theme() === 'dark' ? 'light' : 'dark')}>
          {theme() === 'dark' ? '☾ dark' : '☀ light'}
        </button>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <Dynamic component={VARIANTS.find((v) => v.key === variant())?.C ?? VariantA} />
      <Switcher />
    </>
  )
}

render(() => <App />, document.getElementById('app')!)
