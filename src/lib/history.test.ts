import { expect, it } from 'vitest'
import { outcome, type Attempt } from './history'

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
