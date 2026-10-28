import { For, Match, Show, Switch } from "solid-js";
import { client } from "../lib/client";
import type { ParamDef } from "../methods/registry";
import {
  buildPayload,
  loading,
  paramValues,
  selectedMethod,
  setError,
  setLoading,
  setParamValues,
  setResult,
} from "../state";
import ArrayInput from "./form/ArrayInput";
import BooleanInput from "./form/BooleanInput";
import DatetimeInput from "./form/DatetimeInput";
import EnumMultiSelect from "./form/EnumMultiSelect";
import NumberInput from "./form/NumberInput";

function setValue(name: string, value: unknown) {
  setParamValues((prev) => {
    const next = { ...prev };
    if (value === undefined) delete next[name];
    else next[name] = value;
    return next;
  });
}

function FieldRenderer(props: { param: ParamDef }) {
  const value = () => paramValues()[props.param.name];
  const onChange = (v: unknown) => setValue(props.param.name, v);

  return (
    <Switch>
      <Match when={props.param.kind === "id"}>
        <NumberInput name="id" value={value()} required onChange={onChange} />
      </Match>
      <Match when={props.param.kind === "number"}>
        <NumberInput name={props.param.name} value={value()} onChange={onChange} />
      </Match>
      <Match when={props.param.kind === "numberArray"}>
        <ArrayInput name={props.param.name} value={value()} itemType="number" onChange={onChange} />
      </Match>
      <Match when={props.param.kind === "stringArray"}>
        <ArrayInput name={props.param.name} value={value()} itemType="string" onChange={onChange} />
      </Match>
      <Match when={props.param.kind === "enumArray"}>
        <EnumMultiSelect
          name={props.param.name}
          value={value()}
          options={(props.param as Extract<ParamDef, { kind: "enumArray" }>).options}
          onChange={onChange}
        />
      </Match>
      <Match when={props.param.kind === "boolean"}>
        <BooleanInput name={props.param.name} value={value()} onChange={onChange} />
      </Match>
      <Match when={props.param.kind === "datetime"}>
        <DatetimeInput name={props.param.name} value={value()} onChange={onChange} />
      </Match>
    </Switch>
  );
}

const run = async () => {
  const c = client();
  if (!c) {
    setError(new Error("Set an API key first"));
    return;
  }
  setLoading(true);
  setError(undefined);
  setResult(undefined);
  try {
    const args = buildPayload();
    const res = await selectedMethod().invoke(c, args);
    setResult(res);
  } catch (err) {
    setError(err);
  } finally {
    setLoading(false);
  }
};

const canRun = () => {
  if (!client()) return false;
  const m = selectedMethod();
  const needsId = m.params.some((p) => p.kind === "id");
  if (needsId) {
    const id = paramValues().id;
    return typeof id === "number" && Number.isFinite(id);
  }
  return true;
};

export default function ParametersPanel() {
  return (
    <div class="flex h-full flex-col gap-4 overflow-y-auto border-r border-zinc-800 bg-zinc-950 p-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold tracking-wider text-zinc-400 uppercase">Parameters</h2>
      </div>

      <Show
        when={selectedMethod().params.length > 0}
        fallback={<p class="text-sm text-zinc-500">This method takes no parameters.</p>}
      >
        <div class="flex flex-col gap-3">
          <For each={selectedMethod().params}>{(param) => <FieldRenderer param={param} />}</For>
        </div>
      </Show>

      <div class="mt-auto flex flex-col gap-2 pt-4">
        <button
          type="button"
          onClick={run}
          disabled={!canRun() || loading()}
          class="rounded-md bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-purple-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500"
        >
          {loading() ? "Running…" : "Run"}
        </button>
        <Show when={!client()}>
          <p class="text-xs text-amber-400">Set an API key in the header to enable.</p>
        </Show>
      </div>
    </div>
  );
}
