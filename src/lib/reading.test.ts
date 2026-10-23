import { expect, it } from 'vitest'
import { joinReading } from './reading'

const t = (surface: string, reading?: string) => ({ surface, reading })

it('joins the kana reading of each token as hiragana', () => {
  expect(joinReading([t('東京', 'トウキョウ'), t('へ', 'ヘ'), t('行っ', 'イッ'), t('た', 'タ')])).toBe('とうきょうへいった')
})

it('uses the surface form for tokens without a reading', () => {
  expect(joinReading([t('ABC', '*'), t('の', 'ノ'), t('!')])).toBe('ABCの!')
})

it('converts katakana surfaces to hiragana and keeps the long-vowel mark', () => {
  expect(joinReading([t('ツリー', 'ツリー')])).toBe('つりー')
})

it('overrides counter words that span several tokens', () => {
  expect(joinReading([t('一', 'イチ'), t('人', 'ニン'), t('で', 'デ')])).toBe('ひとりで')
  expect(joinReading([t('二', 'ニ'), t('十', 'ジュウ'), t('日', 'ニチ')])).toBe('はつか')
})

it('prefers the longest override', () => {
  expect(joinReading([t('二', 'ニ'), t('日', 'ニチ')])).toBe('ふつか')
  expect(joinReading([t('二', 'ニ'), t('十', 'ジュウ'), t('日', 'ニチ'), t('に', 'ニ')])).toBe('はつかに')
})

it('does not override across a partial token', () => {
  expect(joinReading([t('一人前', 'イチニンマエ')])).toBe('いちにんまえ')
})
