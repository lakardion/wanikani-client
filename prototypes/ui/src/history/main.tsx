/** PROTOTYPE: three History variants on one page, switched by ?variant=, ?theme=, the jump chips and the import outcome. */
import { createEffect, createSignal, For, onCleanup } from 'solid-js'
import { Dynamic, render } from 'solid-js/web'
import '../index.css'
import { importOutcome, jump, JUMPS, setImportOutcome } from './fake'
import { VariantA, VariantB, VariantC } from './variants'

const VARIANTS = [
  { key: 'A', name: 'Header icon, tabs', C: VariantA },
  { key: 'B', name: 'Drawer over the loop', C: VariantB },
  { key: 'C', name: 'Stats first', C: VariantC },
]
const IMPORTS = ['ok', 'again', 'invalid', 'newer'] as const

const params = new URLSearchParams(location.search)
const [variant, setVariant] = createSignal(params.get('variant') ?? 'A')
const [theme, setTheme] = createSignal(params.get('theme') ?? 'light')

createEffect(() => {
  history.replaceState(null, '', `?${new URLSearchParams({ variant: variant(), theme: theme() })}`)
  document.documentElement.dataset.kbTheme = theme()
})

function cycle<T>(list: readonly T[], current: T, step: number) {
  return list[(list.indexOf(current) + step + list.length) % list.length]
}

function Switcher() {
  const keys = VARIANTS.map((v) => v.key)
  const onKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('input, textarea, [contenteditable]')) return
    if (e.key === 'ArrowLeft') setVariant(cycle(keys, variant(), -1))
    if (e.key === 'ArrowRight') setVariant(cycle(keys, variant(), 1))
  }
  window.addEventListener('keydown', onKey)
  onCleanup(() => window.removeEventListener('keydown', onKey))
  const chip = 'rounded-full px-2 py-1 text-[11px] leading-none bg-white/15'
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
        <For each={JUMPS}>{(j) => <button class={chip} onClick={() => jump(j)}>{j}</button>}</For>
      </div>
      <div class="flex flex-wrap justify-center gap-1">
        <button class={chip} onClick={() => setImportOutcome(cycle(IMPORTS, importOutcome(), 1))}>
          next import: {importOutcome()}
        </button>
        <button class={chip} onClick={() => setTheme(theme() === 'dark' ? 'light' : 'dark')}>
          {theme() === 'dark' ? '☾ dark' : '☀ light'}
        </button>
      </div>
    </div>
  )
}

render(
  () => (
    <>
      <Dynamic component={VARIANTS.find((v) => v.key === variant())?.C ?? VariantA} />
      <Switcher />
    </>
  ),
  document.getElementById('app')!,
)
