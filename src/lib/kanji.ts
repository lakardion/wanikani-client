const KANJI_RE = /[㐀-䶿一-鿿]/g;

/** Kanji in `text` that are not in `allowed`. */
export const kanjiViolations = (text: string, allowed: string) =>
  [...new Set(text.match(KANJI_RE) ?? [])].filter((k) => !allowed.includes(k));
