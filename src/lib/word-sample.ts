import type { KnownItem } from "./known-items";

export const WORD_SAMPLE_SIZE = 150;

export const GROUPS = ["noun", "verb", "adjective", "adverb", "other"] as const;
export type WordGroup = (typeof GROUPS)[number];

export type Word = { characters: string; meaning: string };

/** Maps one WaniKani part-of-speech string to its **Word group**. */
function groupOfOne(pos: string): WordGroup {
  const s = pos.toLowerCase();
  if (s === "noun" || s === "proper noun" || s === "independent noun") return "noun";
  if (s.includes("adverb")) return "adverb";
  if (s.includes("verb")) return "verb";
  if (s.includes("adjective")) return "adjective";
  return "other";
}

/** The first group in `GROUPS` order that matches one of the word's parts of speech. */
export function groupOf(partsOfSpeech: string[]): WordGroup {
  const groups = new Set(partsOfSpeech.map(groupOfOne));
  return GROUPS.find((g) => groups.has(g)) ?? "other";
}

const shuffle = <T>(a: T[]) =>
  a
    .map((v) => [Math.random(), v] as const)
    .toSorted((x, y) => x[0] - y[0])
    .map(([, v]) => v);

/** The **Word sample**: equal slots per **Word group**, short groups filled at random from the other words, and every **Known kanji**. */
export function wordSample(
  items: KnownItem[],
  size = WORD_SAMPLE_SIZE,
): { sample: Word[]; kanji: string } {
  const perGroup = size / GROUPS.length;
  const words = shuffle(items.filter((i) => i.type !== "kanji"));
  const picked = new Set<KnownItem>();
  for (const g of GROUPS) {
    let n = 0;
    for (const w of words) {
      if (n === perGroup) break;
      if (groupOf(w.partsOfSpeech) !== g) continue;
      picked.add(w);
      n++;
    }
  }
  for (const w of words) {
    if (picked.size >= size) break;
    picked.add(w);
  }
  return {
    sample: [...picked].map(({ characters, meaning }) => ({ characters, meaning })),
    kanji: items
      .filter((i) => i.type === "kanji")
      .map((i) => i.characters)
      .join(""),
  };
}
