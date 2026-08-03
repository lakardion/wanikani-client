import { For } from 'solid-js'

type Props = {
  name: string
  value: unknown
  options: readonly string[]
  onChange: (v: string[] | undefined) => void
}

export default function EnumMultiSelect(props: Props) {
  const selected = (): string[] => (Array.isArray(props.value) ? (props.value as string[]) : [])

  const toggle = (opt: string) => {
    const cur = selected()
    const next = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt]
    props.onChange(next.length ? next : undefined)
  }

  return (
    <div class="flex flex-col gap-1">
      <label class="flex items-baseline gap-1 text-xs font-medium text-zinc-300">
        <span class="font-mono">{props.name}</span>
        <span class="text-zinc-500">enum[]</span>
      </label>
      <div class="flex flex-wrap gap-1">
        <For each={props.options}>
          {(opt) => {
            const active = () => selected().includes(opt)
            return (
              <button
                type="button"
                onClick={() => toggle(opt)}
                class={`rounded-md border px-2 py-1 font-mono text-xs ${
                  active()
                    ? 'border-purple-500 bg-purple-500/20 text-purple-200'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {opt}
              </button>
            )
          }}
        </For>
      </div>
    </div>
  )
}
