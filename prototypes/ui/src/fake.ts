/** PROTOTYPE: in-memory fake app state. No WaniKani calls, no localStorage. */
import { createSignal } from 'solid-js'

export type Screen = 'key' | 'syncing' | 'empty' | 'ready'
export const SCREENS: Screen[] = ['key', 'syncing', 'empty', 'ready']

export const TOTAL = 1834
export const [screen, setScreen] = createSignal<Screen>('key')
export const [progress, setProgress] = createSignal(0)
export const [syncError, setSyncError] = createSignal<string | null>(null)
export const [refreshing, setRefreshing] = createSignal(false)
export const [lastSync, setLastSync] = createSignal('2 min ago')
export const known = { words: 1203, kanji: 631, emptyWords: 12 }
export const NOTE =
  'Use a read-only token. It is stored only in this browser. If it is exposed, regenerate it in WaniKani settings.'
export const SYNC_ERROR = 'Sync failed: WaniKani did not answer (503). Your stored items are still in use.'

let timer: number | undefined
/** Fakes the first-run sync: counts up, then lands on `ready` (or `empty`). */
export function startFirstRun(end: Screen = 'ready') {
  clearInterval(timer)
  setSyncError(null)
  setProgress(0)
  setScreen('syncing')
  timer = setInterval(() => {
    const next = Math.min(TOTAL, progress() + 97)
    setProgress(next)
    if (next === TOTAL) {
      clearInterval(timer)
      setLastSync('just now')
      setScreen(end)
    }
  }, 120) as unknown as number
}

export function stopSync() {
  clearInterval(timer)
}

/** Fakes an incremental Refresh: stays on the current screen, spins for a moment. */
export function refresh(fail = false) {
  setRefreshing(true)
  setTimeout(() => {
    setRefreshing(false)
    if (fail) setSyncError(SYNC_ERROR)
    else setLastSync('just now')
  }, 1200)
}

export function clearKey() {
  stopSync()
  setSyncError(null)
  setScreen('key')
}
