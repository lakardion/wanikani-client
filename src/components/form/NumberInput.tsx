type Props = {
  name: string;
  value: unknown;
  onChange: (v: number | undefined) => void;
  required?: boolean;
};

export default function NumberInput(props: Props) {
  return (
    <div class="flex flex-col gap-1">
      <label class="flex items-baseline gap-1 text-xs font-medium text-zinc-300">
        <span class="font-mono">{props.name}</span>
        {props.required ? <span class="text-red-400">*</span> : null}
        <span class="text-zinc-500">number</span>
      </label>
      <input
        type="number"
        value={typeof props.value === "number" ? String(props.value) : ""}
        onInput={(e) => {
          const raw = e.currentTarget.value;
          if (raw === "") return props.onChange(undefined);
          const n = Number(raw);
          props.onChange(Number.isFinite(n) ? n : undefined);
        }}
        class="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-sm text-zinc-100 focus:border-purple-500 focus:outline-none"
      />
    </div>
  );
}
