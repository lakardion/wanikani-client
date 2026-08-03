type Props = {
  name: string
  value: unknown
  onChange: (v: string | undefined) => void
}

export default function DatetimeInput(props: Props) {
  const isoToLocal = (iso: string): string => {
    if (!iso) return ''
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div class="flex flex-col gap-1">
      <label class="flex items-baseline gap-1 text-xs font-medium text-zinc-300">
        <span class="font-mono">{props.name}</span>
        <span class="text-zinc-500">ISO timestamp</span>
      </label>
      <input
        type="datetime-local"
        value={typeof props.value === 'string' ? isoToLocal(props.value) : ''}
        onInput={(e) => {
          const raw = e.currentTarget.value
          if (raw === '') return props.onChange(undefined)
          const d = new Date(raw)
          if (Number.isNaN(d.getTime())) return props.onChange(undefined)
          props.onChange(d.toISOString())
        }}
        class="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-sm text-zinc-100 focus:border-purple-500 focus:outline-none"
      />
    </div>
  )
}
