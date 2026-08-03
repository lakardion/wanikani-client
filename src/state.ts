import { createSignal } from 'solid-js'
import { loadApiKey, loadSelectedMethod, saveApiKey, saveSelectedMethod } from './lib/storage'
import { METHODS, METHODS_BY_ID } from './methods/registry'
import type { MethodEntry } from './methods/registry'

const initialMethodId = loadSelectedMethod() ?? METHODS[0].id
const initialMethod = METHODS_BY_ID.get(initialMethodId) ?? METHODS[0]

export const [apiKey, setApiKeyRaw] = createSignal(loadApiKey())
export const [selectedMethod, setSelectedMethodRaw] = createSignal<MethodEntry>(initialMethod)
export const [paramValues, setParamValues] = createSignal<Record<string, unknown>>({})
export const [result, setResult] = createSignal<unknown>(undefined)
export const [error, setError] = createSignal<unknown>(undefined)
export const [loading, setLoading] = createSignal(false)

export function setApiKey(value: string) {
  setApiKeyRaw(value)
  saveApiKey(value)
}

export function setSelectedMethod(m: MethodEntry) {
  setSelectedMethodRaw(m)
  saveSelectedMethod(m.id)
  setParamValues({})
  setResult(undefined)
  setError(undefined)
}

export function buildPayload(): Record<string, unknown> {
  const values = paramValues()
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined || v === null || v === '') continue
    if (Array.isArray(v) && v.length === 0) continue
    out[k] = v
  }
  return out
}
