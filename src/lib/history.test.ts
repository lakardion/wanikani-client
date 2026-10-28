import { describe, expect, it } from 'vitest'
import { merge, outcome, parseExport, passRate, sinceExport, stats, VERSION, type Attempt, type HistoryRecord, type Outcome } from './history'

const pass: Attempt = { answer: 'I eat sushi', score: 90, feedback: 'Good.', pass: true }
const fail: Attempt = { answer: 'I drink sushi', score: 40, feedback: 'The verb is off.', pass: false }
const giveUp: Attempt = { answer: '', giveUp: true }

it.each<[string, Attempt[], string]>([
  ['a pass', [pass], 'pass'],
  ['a pass on the retry', [fail, pass], 'pass'],
  ['two fails', [fail, fail], 'fail'],
  ['a give up', [giveUp], 'give_up'],
  ['a fail then a give up', [fail, giveUp], 'give_up'],
])('%s is %s', (_, attempts, expected) => {
  expect(outcome(attempts)).toBe(expected)
})

const rec = (grammarId: string, outcome: Outcome) => ({ outcome, exercise: { grammarId } }) as HistoryRecord

describe('stats', () => {
  const records = [
    rec('n5-tai', 'pass'),
    rec('n5-tai', 'fail'),
    rec('n5-desu', 'pass'),
    rec('n5-desu', 'pass'),
    rec('n5-mashou', 'give_up'),
    rec('n5-ichiban', 'pass'),
    rec('n5-ichiban', 'give_up'),
    rec('n5-ichiban', 'fail'),
    rec('n5-ichiban', 'pass'),
    rec('gone-id', 'fail'),
    rec('gone-id', 'fail'),
  ]
  const { overall, points } = stats(records)

  it('counts the totals', () => {
    expect(overall).toEqual({ done: 11, passed: 5, gaveUp: 2 })
    expect(passRate(overall)).toBe(45)
  })

  it('counts one row per Grammar point', () => {
    expect(points.find((p) => p.grammarId === 'n5-ichiban')).toEqual({
      grammarId: 'n5-ichiban',
      pattern: '〜がいちばん',
      done: 4,
      passed: 2,
      gaveUp: 1,
    })
  })

  it('sorts by pass rate, lowest first, then by count, highest first', () => {
    expect(points.map((p) => p.grammarId)).toEqual(['gone-id', 'n5-mashou', 'n5-ichiban', 'n5-tai', 'n5-desu'])
  })

  it('shows an unknown grammarId as the raw id', () => {
    expect(points.find((p) => p.grammarId === 'gone-id')?.pattern).toBe('gone-id')
  })
})

const full = (id: string, finishedAt = '2026-10-01T10:00:00.000Z'): HistoryRecord => ({
  id,
  finishedAt,
  outcome: 'pass',
  exercise: {
    grammarId: 'n5-tai',
    japanese: 'すしを食べたい。',
    english: 'I want to eat sushi.',
    furigana: [{ text: 'すしを' }, { text: '食', ruby: 'た' }, { text: 'べたい。' }],
    breakdown: [{ text: '食べたい', meaning: 'want to eat', furigana: [{ text: '食', ruby: 'た' }, { text: 'べたい' }] }],
    grammarExplanation: 'たい means want to.',
    example: { japanese: '水を飲みたい。', english: 'I want to drink water.', furigana: [{ text: '水', ruby: 'みず' }, { text: 'を' }] },
  },
  attempts: [pass],
})

const file = (records: unknown[], version = VERSION) =>
  JSON.stringify({ app: 'wanikani-client', kind: 'history', version, exportedAt: '2026-10-02T00:00:00.000Z', records })

describe('import', () => {
  const records = [full('a'), { ...full('b'), outcome: 'give_up', attempts: [fail, giveUp] }] as HistoryRecord[]

  it('reads a valid file', () => {
    expect(parseExport(file(records))).toEqual({ kind: 'ok', records })
  })

  it('rejects a file that is not JSON', () => {
    expect(parseExport('not json')).toEqual({ kind: 'invalid' })
  })

  it.each([
    ['another app', JSON.stringify({ ...JSON.parse(file(records)), app: 'other' })],
    ['a bad record', file([records[0], { ...records[1], outcome: 'won' }])],
    ['a record without attempts', file([{ ...records[0], attempts: [] }])],
  ])('rejects %s, all or nothing', (_, text) => {
    expect(parseExport(text)).toEqual({ kind: 'invalid' })
  })

  it('rejects a newer version', () => {
    expect(parseExport(file(records, VERSION + 1))).toEqual({ kind: 'newer' })
  })

  it('imports 0 from the same file a second time', () => {
    const first = merge([], records)
    expect(first).toEqual({ added: records, skipped: 0 })
    expect(merge(first.added, records)).toEqual({ added: [], skipped: 2 })
  })

  it('keeps the record that is already present', () => {
    expect(merge([full('a')], [full('a', '2026-01-01T00:00:00.000Z'), full('c')])).toEqual({ added: [full('c')], skipped: 1 })
  })
})

describe('export reminder count', () => {
  const records = [full('a', '2026-10-01T10:00:00.000Z'), full('b', '2026-10-03T10:00:00.000Z'), full('c', '2026-10-05T10:00:00.000Z')]

  it.each<[string, string | null, string | null, number]>([
    ['neither time', null, null, 3],
    ['a last export', '2026-10-02T00:00:00.000Z', null, 2],
    ['a dismiss', null, '2026-10-04T00:00:00.000Z', 1],
    ['a later export than the dismiss', '2026-10-04T00:00:00.000Z', '2026-10-02T00:00:00.000Z', 1],
    ['a later dismiss than the export', '2026-10-02T00:00:00.000Z', '2026-10-06T00:00:00.000Z', 0],
  ])('counts with %s', (_, lastExportAt, dismissedAt, expected) => {
    expect(sinceExport(records, lastExportAt, dismissedAt)).toBe(expected)
  })
})
