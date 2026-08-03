type Props = {
  name: string
  value: unknown
  onChange: (v: boolean | undefined) => void
}

export default function BooleanInput(props: Props) {
  const v = props.value
  const state: 'unset' | 'true' | 'false' = v === true ? 'true' : v === false ? 'false' : 'unset'
  return (
    <div class="flex flex-col gap-1">
      <label class="flex items-baseline gap-1 text-xs font-medium text-zinc-300">
        <span class="font-mono">{props.name}</span>
        <span class="text-zinc-500">boolean</span>
      </label>
      <div class="flex gap-1">
        <Button active={state === 'unset'} onClick={() => props.onChange(undefined)}>
          unset
        </Button>
        <Button active={state === 'true'} onClick={() => props.onChange(true)}>
          true
        </Button>
        <Button active={state === 'false'} onClick={() => props.onChange(false)}>
          false
        </Button>
      </div>
    </div>
  )
}

function Button(props: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      class={`rounded-md border px-2 py-1 font-mono text-xs ${
        props.active
          ? 'border-purple-500 bg-purple-500/20 text-purple-200'
          : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
      }`}
    >
      {props.children}
    </button>
  )
}
