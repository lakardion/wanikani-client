import { For } from 'solid-js'
import { METHODS_BY_ID, METHODS_BY_NAMESPACE } from '../methods/registry'
import { selectedMethod, setSelectedMethod } from '../state'

export default function MethodPicker() {
  return (
    <div class="flex flex-col gap-1">
      <label for="method" class="text-xs uppercase tracking-wider text-zinc-500">
        Method
      </label>
      <select
        id="method"
        value={selectedMethod().id}
        onChange={(e) => {
          const m = METHODS_BY_ID.get(e.currentTarget.value)
          if (m) setSelectedMethod(m)
        }}
        class="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 font-mono text-sm text-zinc-100 focus:border-purple-500 focus:outline-none"
      >
        <For each={Object.entries(METHODS_BY_NAMESPACE)}>
          {([ns, methods]) => (
            <optgroup label={ns}>
              <For each={methods}>
                {(m) => <option value={m.id}>{m.label}</option>}
              </For>
            </optgroup>
          )}
        </For>
      </select>
    </div>
  )
}
