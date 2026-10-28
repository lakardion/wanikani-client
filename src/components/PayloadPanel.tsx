import { buildPayload, selectedMethod } from "../state";

const code = () => {
  const m = selectedMethod();
  const args = buildPayload();
  const argsJson = JSON.stringify(args, null, 2);
  if (m.method === "get") {
    const id = args.id;
    return `client.${m.namespace}.get(${id ?? "/* id */"})`;
  }
  if (m.params.length === 0) {
    return `client.${m.namespace}.${m.method}()`;
  }
  return `client.${m.namespace}.${m.method}(${argsJson})`;
};

export default function PayloadPanel() {
  return (
    <div class="flex h-full flex-col overflow-hidden border-r border-zinc-800 bg-zinc-950">
      <div class="border-b border-zinc-800 px-4 py-3">
        <h2 class="text-sm font-semibold tracking-wider text-zinc-400 uppercase">
          Request payload
        </h2>
      </div>
      <pre class="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed text-zinc-200">
        {code()}
      </pre>
    </div>
  );
}
