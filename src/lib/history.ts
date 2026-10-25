import { createSignal } from 'solid-js'
import type { Exercise } from '~/server/exercise'

export type Attempt = { answer: string; score: number; feedback: string; pass: boolean } | { answer: string; giveUp: true }
export type Outcome = 'pass' | 'fail' | 'give_up'
export type HistoryRecord = {
  id: string
  finishedAt: string
  outcome: Outcome
  exercise: Exercise
  attempts: Attempt[]
}

/** The outcome of a finished **Exercise**, from its last **Attempt**. */
export function outcome(attempts: Attempt[]): Outcome {
  const last = attempts.at(-1)!
  if ('giveUp' in last) return 'give_up'
  return last.pass ? 'pass' : 'fail'
}

const DB_NAME = 'wanikani-history'
const STORE = 'records'
/** The schema version, shared by the IndexedDB records and the export file. */
export const VERSION = 1

let db: Promise<IDBDatabase> | undefined

function open() {
  db ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = (e) => {
      if (e.oldVersion < 1) req.result.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  }).catch((e) => {
    db = undefined
    throw e
  })
  return db
}

/** Resolves when the transaction commits, so a `QuotaExceededError` rejects. */
async function put(record: HistoryRecord) {
  const tx = (await open()).transaction(STORE, 'readwrite')
  tx.objectStore(STORE).put(record)
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onabort = () => reject(tx.error)
  })
}

export async function getAll() {
  const req = (await open()).transaction(STORE).objectStore(STORE).getAll()
  return new Promise<HistoryRecord[]>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

const ON_KEY = 'wanikani.history.on'
const WARNING_KEY = 'wanikani.history.warningDismissed'
const LAST_EXPORT_KEY = 'wanikani.history.lastExportAt'

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}

export const [recordingOn, setRecordingOnRaw] = createSignal(read(ON_KEY) !== 'false')
export const [warningDismissed, setWarningDismissed] = createSignal(read(WARNING_KEY) === 'true')
export const lastExportAt = () => read(LAST_EXPORT_KEY)

export function setRecordingOn(on: boolean) {
  setRecordingOnRaw(on)
  write(ON_KEY, String(on))
}

export function dismissWarning() {
  setWarningDismissed(true)
  write(WARNING_KEY, 'true')
  void navigator.storage?.persist()
}

export const persisted = async () => (await navigator.storage?.persisted()) ?? false

/** Asks again for persistent storage once the first-open warning made the first request. */
export async function ensurePersisted() {
  if (recordingOn() && warningDismissed() && !(await persisted())) await navigator.storage.persist()
}

/** Records whose `put` failed. A reload loses them. */
export const [queue, setQueue] = createSignal<HistoryRecord[]>([])
/** False after × on the save-failed alert, until the next failed write. */
export const [saveFailedShown, setSaveFailedShown] = createSignal(true)

/** Records a finished **Exercise**, after the queued records. */
export async function record(exercise: Exercise, attempts: Attempt[]) {
  if (!recordingOn()) return
  const next: HistoryRecord = {
    id: crypto.randomUUID(),
    finishedAt: new Date().toISOString(),
    outcome: outcome(attempts),
    exercise,
    attempts,
  }
  const failed: HistoryRecord[] = []
  for (const r of [...queue(), next]) {
    try {
      await put(r)
    } catch {
      failed.push(r)
    }
  }
  setQueue(failed)
  if (failed.length) setSaveFailedShown(true)
  await ensurePersisted()
}
