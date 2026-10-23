/** One tokenizer token: the surface form and its IPADIC kana reading (`*` or missing when unknown). */
export type Token = { surface: string; reading?: string }

/** Known IPADIC errors, keyed by the joined surface of consecutive tokens. */
const OVERRIDES: Record<string, string> = {
  一人: 'ひとり',
  二人: 'ふたり',
  一日: 'ついたち',
  二日: 'ふつか',
  二十日: 'はつか',
  一つ: 'ひとつ',
  今日: 'きょう',
  明日: 'あした',
  大人: 'おとな',
}
const MAX_KEY = Math.max(...Object.keys(OVERRIDES).map((k) => k.length))

export const toHiragana = (s: string) => s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))

/** Hiragana reading of a tokenized text. The longest override that spans whole tokens wins over the token readings. */
export function joinReading(tokens: Token[]) {
  let out = ''
  for (let i = 0; i < tokens.length; ) {
    let surface = ''
    let end = i
    let override = ''
    for (let j = i; j < tokens.length && surface.length < MAX_KEY; j++) {
      surface += tokens[j].surface
      if (OVERRIDES[surface]) [end, override] = [j + 1, OVERRIDES[surface]]
    }
    if (override) {
      out += override
      i = end
    } else {
      const { surface, reading } = tokens[i++]
      out += toHiragana(reading && reading !== '*' ? reading : surface)
    }
  }
  return out
}
