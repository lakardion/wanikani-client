/** PROTOTYPE: in-memory fake History. No IndexedDB; signals stand in for the store and the localStorage flags. */
import { createSignal } from 'solid-js'

export type Attempt = { answer: string; score: number; feedback: string; pass: boolean } | { answer: string; giveUp: true }
export type Outcome = 'pass' | 'fail' | 'give_up'
export type HistoryRecord = {
  id: string
  finishedAt: string
  outcome: Outcome
  exercise: { grammarId: string; japanese: string; reading: string; english: string }
  attempts: Attempt[]
}

export const GRAMMAR: Record<string, { pattern: string; meaning: string }> = {
  'n5-te-kara': { pattern: '〜てから', meaning: 'after doing' },
  'n5-tai': { pattern: '〜たい', meaning: 'want to do' },
  'n5-mae-ni': { pattern: '〜まえに', meaning: 'before doing' },
  'n4-tara': { pattern: '〜たら', meaning: 'if / when (conditional)' },
  'n4-ta-koto-ga-aru': { pattern: '〜たことがある', meaning: 'have done before' },
}
export const grammarLabel = (id: string) => GRAMMAR[id]?.pattern ?? id

const SENTENCES: [string, string, string, string][] = [
  ['n5-te-kara', '宿題をしてから、友達と公園で遊びました。', 'しゅくだいをしてから、ともだちとこうえんであそびました。', 'After doing my homework, I played in the park with a friend.'],
  ['n5-tai', '週末は山に登りたいです。', 'しゅうまつはやまにのぼりたいです。', 'I want to climb a mountain at the weekend.'],
  ['n5-mae-ni', '寝る前に本を読みます。', 'ねるまえにほんをよみます。', 'I read a book before I sleep.'],
  ['n4-tara', '雨が降ったら、家にいます。', 'あめがふったら、いえにいます。', 'If it rains, I will stay home.'],
  ['n4-ta-koto-ga-aru', '日本で寿司を食べたことがあります。', 'にほんですしをたべたことがあります。', 'I have eaten sushi in Japan.'],
  ['n5-te-kara', '手を洗ってから、ご飯を食べます。', 'てをあらってから、ごはんをたべます。', 'I eat after I wash my hands.'],
  ['retired-grammar-id', '駅まで歩きました。', 'えきまであるきました。', 'I walked to the station.'],
]

const pass = (answer: string, score = 88): Attempt => ({ answer, score, feedback: 'Good. The meaning and the grammar are there.', pass: true })
const fail = (answer: string, score = 45): Attempt => ({ answer, score, feedback: 'The order of the actions is lost.', pass: false })
const giveUp = (answer = ''): Attempt => ({ answer, giveUp: true })

const ATTEMPT_SETS: [Outcome, Attempt[]][] = [
  ['pass', [pass('After homework I played at the park with my friend.')]],
  ['pass', [fail('I played in the park and did homework.'), pass('After my homework, I played with a friend in the park.', 76)]],
  ['fail', [fail('I read a book and sleep.', 40), fail('While sleeping I read.', 52)]],
  ['give_up', [giveUp()]],
  ['give_up', [fail('I ate sushi.', 50), giveUp('?')]],
]

function makeRecords(n: number): HistoryRecord[] {
  const now = Date.parse('2026-10-24T18:00:00Z')
  return Array.from({ length: n }, (_, i) => {
    const [grammarId, japanese, reading, english] = SENTENCES[(i * 3) % SENTENCES.length]
    const [outcome, attempts] = ATTEMPT_SETS[(i * 7) % ATTEMPT_SETS.length]
    return {
      id: `rec-${i}`,
      finishedAt: new Date(now - i * 47 * 60 * 1000 - Math.floor(i / 6) * 20 * 3600 * 1000).toISOString(),
      outcome,
      exercise: { grammarId, japanese, reading, english },
      attempts,
    }
  })
}

export const [records, setRecords] = createSignal<HistoryRecord[]>(makeRecords(42))
export const [recordingOn, setRecordingOn] = createSignal(true)
export const [warningDismissed, setWarningDismissed] = createSignal(true)
export const [persisted, setPersisted] = createSignal(true)
export const [lastExportAt, setLastExportAt] = createSignal<string | null>('2026-10-12T09:30:00Z')
/** Records added after the last export; the reminder shows at 50. */
export const [sinceExport, setSinceExport] = createSignal(12)
export const [reminderSnoozedAt, setReminderSnoozedAt] = createSignal(0)
/** The memory queue of failed writes. */
export const [unsaved, setUnsaved] = createSignal(0)
export type ImportResult = { kind: 'ok'; imported: number; skipped: number } | { kind: 'invalid' } | { kind: 'newer' }
export const [importOutcome, setImportOutcome] = createSignal<'ok' | 'again' | 'invalid' | 'newer'>('ok')
export const [importResult, setImportResult] = createSignal<ImportResult | null>(null)

export const showReminder = () => recordingOn() && sinceExport() >= 50 && sinceExport() - reminderSnoozedAt() >= 50

export function exportFile() {
  setLastExportAt(new Date().toISOString())
  setSinceExport(0)
  setReminderSnoozedAt(0)
}

export function importFile() {
  const o = importOutcome()
  if (o === 'invalid' || o === 'newer') return setImportResult({ kind: o })
  if (o === 'again') return setImportResult({ kind: 'ok', imported: 0, skipped: records().length })
  const added = makeRecords(54).slice(42)
  setRecords([...records(), ...added].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt)))
  setImportResult({ kind: 'ok', imported: added.length, skipped: 30 })
}

export const importText = (r: ImportResult) =>
  r.kind === 'ok'
    ? `Imported ${r.imported}, skipped ${r.skipped} (already present).`
    : r.kind === 'invalid'
      ? 'This file is not a History export. Nothing was imported.'
      : 'This file comes from a newer version of the app. Reload the app, then import again. Nothing was imported.'

export function deleteHistory() {
  setRecords([])
  setLastExportAt(null)
  setSinceExport(0)
  setImportResult(null)
}

export type Stat = { done: number; passed: number; gaveUp: number }
const add = (s: Stat, r: HistoryRecord) => {
  s.done++
  if (r.outcome === 'pass') s.passed++
  if (r.outcome === 'give_up') s.gaveUp++
}
export function stats() {
  const overall: Stat = { done: 0, passed: 0, gaveUp: 0 }
  const per = new Map<string, Stat>()
  for (const r of records()) {
    add(overall, r)
    const id = r.exercise.grammarId
    if (!per.has(id)) per.set(id, { done: 0, passed: 0, gaveUp: 0 })
    add(per.get(id)!, r)
  }
  return { overall, per: [...per.entries()].map(([id, s]) => ({ id, ...s })) }
}
export const pct = (s: Stat) => (s.done ? Math.round((s.passed / s.done) * 100) : 0)

export const fmtDate = (iso: string) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
export const fmtDay = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

export const JUMPS = ['normal', 'first open', 'empty', 'reminder', 'save failed', 'not persistent', 'recording off'] as const
export function jump(j: (typeof JUMPS)[number]) {
  setRecords(makeRecords(42))
  setRecordingOn(true)
  setWarningDismissed(true)
  setPersisted(true)
  setLastExportAt('2026-10-12T09:30:00Z')
  setSinceExport(12)
  setReminderSnoozedAt(0)
  setUnsaved(0)
  setImportResult(null)
  if (j === 'first open') (setWarningDismissed(false), setRecords([]), setLastExportAt(null), setSinceExport(0), setPersisted(false))
  if (j === 'empty') (setRecords([]), setLastExportAt(null), setSinceExport(0))
  if (j === 'reminder') setSinceExport(52)
  if (j === 'save failed') setUnsaved(1)
  if (j === 'not persistent') setPersisted(false)
  if (j === 'recording off') setRecordingOn(false)
}
