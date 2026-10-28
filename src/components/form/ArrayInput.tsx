type Props = {
  name: string;
  value: unknown;
  itemType: "string" | "number";
  onChange: (v: (string | number)[] | undefined) => void;
};

export default function ArrayInput(props: Props) {
  const display = () => (Array.isArray(props.value) ? props.value.join(", ") : "");

  return (
    <div class="flex flex-col gap-1">
      <label class="flex items-baseline gap-1 text-xs font-medium text-zinc-300">
        <span class="font-mono">{props.name}</span>
        <span class="text-zinc-500">{props.itemType}[] (comma-separated)</span>
      </label>
      <input
        type="text"
        value={display()}
        placeholder={props.itemType === "number" ? "e.g. 1, 2, 3" : "e.g. one, two"}
        onInput={(e) => {
          const raw = e.currentTarget.value;
          const parts = raw
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          if (parts.length === 0) return props.onChange(undefined);
          if (props.itemType === "number") {
            const nums = parts.map((p) => Number(p)).filter((n) => Number.isFinite(n));
            return props.onChange(nums.length ? nums : undefined);
          }
          props.onChange(parts);
        }}
        class="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 font-mono text-sm text-zinc-100 placeholder-zinc-600 focus:border-purple-500 focus:outline-none"
      />
    </div>
  );
}
