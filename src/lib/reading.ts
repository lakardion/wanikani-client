/** One tokenizer token: the surface form and its IPADIC kana reading (`*` or missing when unknown). */
export type Token = { surface: string; reading?: string };

/** A run of text, with the hiragana to show above it when it holds kanji. */
export type Segment = { text: string; ruby?: string };

/** Known IPADIC errors, keyed by the joined surface of consecutive tokens. */
const OVERRIDES: Record<string, string> = {
  一人: "ひとり",
  二人: "ふたり",
  一日: "ついたち",
  二日: "ふつか",
  二十日: "はつか",
  一つ: "ひとつ",
  今日: "きょう",
  明日: "あした",
  大人: "おとな",
};
const MAX_KEY = Math.max(...Object.keys(OVERRIDES).map((k) => k.length));
const KANJI_RUNS = /([㐀-䶿一-鿿々]+)/;

export const toHiragana = (s: string) =>
  s.replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));

/** Tokens with the override table applied: the longest override that spans whole tokens becomes one token. */
function applyOverrides(tokens: Token[]) {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length;) {
    let surface = "";
    let end = i + 1;
    let token = tokens[i];
    for (let j = i; j < tokens.length && surface.length < MAX_KEY; j++) {
      surface += tokens[j].surface;
      if (OVERRIDES[surface]) [end, token] = [j + 1, { surface, reading: OVERRIDES[surface] }];
    }
    out.push(token);
    i = end;
  }
  return out;
}

/** Splits a token so each kanji run gets its part of the reading, and the kana in the surface get none. */
function align({ surface, reading }: Token): Segment[] {
  if (!KANJI_RUNS.test(surface) || !reading || reading === "*") return [{ text: surface }];
  const parts = surface.split(KANJI_RUNS).filter(Boolean);
  const kana = toHiragana(reading);
  const pattern = parts.map((p) =>
    KANJI_RUNS.test(p) ? "(.+?)" : `(${toHiragana(p).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
  );
  const match = new RegExp(`^${pattern.join("")}$`).exec(kana);
  if (!match) return [{ text: surface, ruby: kana }];
  return parts.map((p, i) => (KANJI_RUNS.test(p) ? { text: p, ruby: match[i + 1] } : { text: p }));
}

/** Furigana segments of a tokenized text, in order. */
export const furigana = (tokens: Token[]) => applyOverrides(tokens).flatMap(align);
