import { createSignal } from "solid-js";
import { z } from "zod";
import { GRAMMAR } from "~/lib/grammar";
import type { Exercise } from "~/server/exercise";

export type Attempt =
  | { answer: string; score: number; feedback: string; pass: boolean }
  | { answer: string; giveUp: true };
export type Outcome = "pass" | "fail" | "give_up";
export type HistoryRecord = {
  id: string;
  finishedAt: string;
  outcome: Outcome;
  exercise: Exercise;
  attempts: Attempt[];
};

/** The outcome of a finished **Exercise**, from its last **Attempt**. */
export function outcome(attempts: Attempt[]): Outcome {
  const last = attempts.at(-1)!;
  if ("giveUp" in last) return "give_up";
  return last.pass ? "pass" : "fail";
}

/** The **Grammar point** pattern; an id that is not in `GRAMMAR` shows as the raw id. */
export const pattern = (id: string) => GRAMMAR.find((g) => g.id === id)?.pattern ?? id;

export type Totals = { done: number; passed: number; gaveUp: number };
export type PointStats = Totals & { grammarId: string; pattern: string };

export const passRate = (t: Totals) => Math.round((t.passed / t.done) * 100);

/** Totals overall and per **Grammar point**, weakest first: lowest pass rate, then most records. */
export function stats(records: HistoryRecord[]) {
  const overall: Totals = { done: 0, passed: 0, gaveUp: 0 };
  const byId = new Map<string, PointStats>();
  for (const r of records) {
    const id = r.exercise.grammarId;
    let point = byId.get(id);
    if (!point)
      byId.set(
        id,
        (point = { grammarId: id, pattern: pattern(id), done: 0, passed: 0, gaveUp: 0 }),
      );
    for (const t of [overall, point]) {
      t.done++;
      if (r.outcome === "pass") t.passed++;
      if (r.outcome === "give_up") t.gaveUp++;
    }
  }
  const points = [...byId.values()].sort(
    (a, b) => a.passed * b.done - b.passed * a.done || b.done - a.done,
  );
  return { overall, points };
}

const DB_NAME = "wanikani-history";
const STORE = "records";
/** The schema version, shared by the IndexedDB records and the export file. */
export const VERSION = 1;

/** The upgrade chain: `UPGRADES[v - 1]` turns a version `v` record into a version `v + 1` record. */
const UPGRADES: ((record: any) => any)[] = [];

/** Runs records of version `from` through the upgrade chain to `VERSION`. */
export function upgrade(records: unknown[], from: number) {
  for (let v = from; v < VERSION; v++) records = records.map(UPGRADES[v - 1]);
  return records;
}

const segments = z.array(z.object({ text: z.string(), ruby: z.string().optional() }));
const recordSchema = z.object({
  id: z.string().min(1),
  finishedAt: z.iso.datetime({ offset: true }),
  outcome: z.enum(["pass", "fail", "give_up"]),
  exercise: z.object({
    grammarId: z.string(),
    japanese: z.string(),
    english: z.string(),
    furigana: segments,
    breakdown: z.array(z.object({ text: z.string(), meaning: z.string(), furigana: segments })),
    grammarExplanation: z.string(),
    example: z.object({ japanese: z.string(), english: z.string(), furigana: segments }),
  }),
  attempts: z
    .array(
      z.union([
        z.object({
          answer: z.string(),
          score: z.number(),
          feedback: z.string(),
          pass: z.boolean(),
        }),
        z.object({ answer: z.string(), giveUp: z.literal(true) }),
      ]),
    )
    .min(1),
});
const envelope = z.object({
  app: z.literal("wanikani-client"),
  kind: z.literal("history"),
  version: z.number().int().min(1),
  exportedAt: z.string(),
  records: z.array(z.unknown()),
});

export type Parsed =
  | { kind: "ok"; records: HistoryRecord[] }
  | { kind: "invalid" }
  | { kind: "newer" };

/** Reads an export file: all records valid, or none. */
export function parseExport(text: string): Parsed {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { kind: "invalid" };
  }
  const doc = envelope.safeParse(json);
  if (!doc.success) return { kind: "invalid" };
  if (doc.data.version > VERSION) return { kind: "newer" };
  const records = z.array(recordSchema).safeParse(upgrade(doc.data.records, doc.data.version));
  return records.success
    ? { kind: "ok", records: records.data as HistoryRecord[] }
    : { kind: "invalid" };
}

/** The incoming records whose `id` is new; a record that is already present is kept. */
export function merge(present: HistoryRecord[], incoming: HistoryRecord[]) {
  const ids = new Set(present.map((r) => r.id));
  const added: HistoryRecord[] = [];
  for (const r of incoming) {
    if (ids.has(r.id)) continue;
    ids.add(r.id);
    added.push(r);
  }
  return { added, skipped: incoming.length - added.length };
}

/** Records finished after both the last export and the last × on the reminder; an absent time is the start of time. */
export function sinceExport(
  records: HistoryRecord[],
  lastExportAt: string | null,
  dismissedAt: string | null,
) {
  const after = Math.max(Date.parse(lastExportAt ?? "") || 0, Date.parse(dismissedAt ?? "") || 0);
  return records.filter((r) => Date.parse(r.finishedAt) > after).length;
}

let db: Promise<IDBDatabase> | undefined;

function open() {
  db ??= new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => {
      if (e.oldVersion < 1) return req.result.createObjectStore(STORE, { keyPath: "id" });
      const store = req.transaction!.objectStore(STORE);
      const all = store.getAll();
      all.onsuccess = () => upgrade(all.result, e.oldVersion).forEach((r) => store.put(r));
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }).catch((e) => {
    db = undefined;
    throw e;
  });
  return db;
}

/** One transaction for all records, so a failure writes none. Resolves when it commits, so a `QuotaExceededError` rejects. */
async function transact(change: (store: IDBObjectStore) => void) {
  const tx = (await open()).transaction(STORE, "readwrite");
  change(tx.objectStore(STORE));
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
}

const put = (record: HistoryRecord) => transact((s) => s.put(record));

export async function getAll() {
  const req = (await open()).transaction(STORE).objectStore(STORE).getAll();
  return new Promise<HistoryRecord[]>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const ON_KEY = "wanikani.history.on";
const WARNING_KEY = "wanikani.history.warningDismissed";
const LAST_EXPORT_KEY = "wanikani.history.lastExportAt";
const REMINDER_KEY = "wanikani.history.reminderDismissedAt";

function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const [recordingOn, setRecordingOnRaw] = createSignal(read(ON_KEY) !== "false");
export const [warningDismissed, setWarningDismissed] = createSignal(read(WARNING_KEY) === "true");
export const [lastExportAt, setLastExportAt] = createSignal(read(LAST_EXPORT_KEY));

/** The export reminder count, from the stored records and flags. */
export const reminderCount = async () =>
  sinceExport(await getAll(), lastExportAt(), read(REMINDER_KEY));

export const dismissReminder = () => write(REMINDER_KEY, new Date().toISOString());

/** Downloads every record as one JSON file, then sets `lastExportAt`. */
export async function exportHistory() {
  const now = new Date();
  const doc = {
    app: "wanikani-client",
    kind: "history",
    version: VERSION,
    exportedAt: now.toISOString(),
    records: await getAll(),
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(doc)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `wanikani-history-${now.toLocaleDateString("en-CA")}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url));
  write(LAST_EXPORT_KEY, now.toISOString());
  setLastExportAt(now.toISOString());
}

export type ImportResult =
  | Exclude<Parsed, { kind: "ok" }>
  | { kind: "ok"; imported: number; skipped: number }
  | { kind: "failed" };

/** Adds the new records of an export file, all or nothing. */
export async function importHistory(file: File): Promise<ImportResult> {
  const parsed = parseExport(await file.text());
  if (parsed.kind !== "ok") return parsed;
  try {
    const { added, skipped } = merge(await getAll(), parsed.records);
    await transact((s) => added.forEach((r) => s.put(r)));
    return { kind: "ok", imported: added.length, skipped };
  } catch {
    return { kind: "failed" };
  }
}

/** Deletes every record, the write queue, `lastExportAt` and `reminderDismissedAt`. */
export async function deleteHistory() {
  await transact((s) => s.clear());
  setQueue([]);
  remove(LAST_EXPORT_KEY);
  remove(REMINDER_KEY);
  setLastExportAt(null);
}

export function setRecordingOn(on: boolean) {
  setRecordingOnRaw(on);
  write(ON_KEY, String(on));
}

export function dismissWarning() {
  setWarningDismissed(true);
  write(WARNING_KEY, "true");
  void navigator.storage?.persist();
}

export const persisted = async () => (await navigator.storage?.persisted()) ?? false;

/** Asks again for persistent storage once the first-open warning made the first request. */
export async function ensurePersisted() {
  if (recordingOn() && warningDismissed() && !(await persisted()))
    await navigator.storage.persist();
}

/** Records whose `put` failed. A reload loses them. */
export const [queue, setQueue] = createSignal<HistoryRecord[]>([]);
/** False after × on the save-failed alert, until the next failed write. */
export const [saveFailedShown, setSaveFailedShown] = createSignal(true);

/** Records a finished **Exercise**, after the queued records. */
export async function record(exercise: Exercise, attempts: Attempt[]) {
  if (!recordingOn()) return;
  const next: HistoryRecord = {
    id: crypto.randomUUID(),
    finishedAt: new Date().toISOString(),
    outcome: outcome(attempts),
    exercise,
    attempts,
  };
  const failed: HistoryRecord[] = [];
  for (const r of [...queue(), next]) {
    try {
      await put(r);
    } catch {
      failed.push(r);
    }
  }
  setQueue(failed);
  if (failed.length) setSaveFailedShown(true);
  await ensurePersisted();
}
