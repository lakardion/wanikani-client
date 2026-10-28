import { describe, expect, it } from 'vitest'
import { outcome, passRate, stats, type Attempt, type HistoryRecord, type Outcome } from './history'

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
