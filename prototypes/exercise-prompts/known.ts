/**
 * PROTOTYPE: Known-item sync and Word sample builder, per the known-vocab pipeline decision.
 * Caches to `out/known-items.json` so repeated runs skip the WaniKani fetch.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { WanikaniClient } from "wanikani-sdk";

export type KnownItem = {
  type: "kanji" | "vocabulary" | "kana_vocabulary";
  characters: string;
  meaning: string;
  partsOfSpeech: string[];
};

const CACHE = new URL("./out/known-items.json", import.meta.url).pathname;

export async function loadKnownItems(): Promise<KnownItem[]> {
  if (existsSync(CACHE)) return JSON.parse(readFileSync(CACHE, "utf8"));
  const client = new WanikaniClient();
  const learned = await client.app.learnedSubjects({
    srsStages: [5, 6, 7, 8, 9],
    types: ["kanji", "vocabulary", "kana_vocabulary"],
  });
  const items: KnownItem[] = learned
    .filter(({ subject }) => !subject.data.hidden_at)
    .map(({ subject }) => {
      const d = subject.data as any;
      return {
        type: subject.object as KnownItem["type"],
        characters: d.characters,
        meaning: d.meanings.find((m: any) => m.primary).meaning,
        partsOfSpeech: d.parts_of_speech ?? [],
      };
    });
  mkdirSync(new URL("./out", import.meta.url).pathname, { recursive: true });
  writeFileSync(CACHE, JSON.stringify(items));
  return items;
}

const GROUPS = ["noun", "verb", "adjective", "adverb", "other"] as const;

function groupOfOne(p: string): (typeof GROUPS)[number] {
  const s = p.toLowerCase();
  if (s === "noun" || s === "proper noun" || s === "independent noun") return "noun";
  if (s.includes("adverb")) return "adverb";
  if (s.includes("verb")) return "verb";
  if (s.includes("adjective")) return "adjective";
  return "other";
}

/** First matching group in GROUPS order across all of a word's POS strings. */
function groupOf(pos: string[]): (typeof GROUPS)[number] {
  const gs = new Set(pos.map(groupOfOne));
  return GROUPS.find((g) => gs.has(g)) ?? "other";
}

const shuffle = <T>(a: T[]) => a.map((v) => [Math.random(), v] as const).sort((x, y) => x[0] - y[0]).map(([, v]) => v);

/** 5 Word groups × perGroup words; short groups are topped up at random from the rest. */
export function wordSample(items: KnownItem[], perGroup = 30) {
  const words = items.filter((i) => i.type !== "kanji");
  const byGroup = Map.groupBy(shuffle(words), (w) => groupOf(w.partsOfSpeech));
  const picked = GROUPS.flatMap((g) => (byGroup.get(g) ?? []).slice(0, perGroup));
  const rest = shuffle(words.filter((w) => !picked.includes(w)));
  const sample = [...picked, ...rest].slice(0, perGroup * GROUPS.length);
  return sample.map(({ characters, meaning }) => ({ characters, meaning }));
}

export const knownKanji = (items: KnownItem[]) =>
  items.filter((i) => i.type === "kanji").map((i) => i.characters).join("");

/** Every distinct WaniKani POS string with its count and assigned group. */
export const posReport = (items: KnownItem[]) =>
  [...Map.groupBy(items.flatMap((i) => i.partsOfSpeech), (p) => p)]
    .map(([p, xs]) => ({ pos: p, count: xs.length, group: groupOfOne(p) }))
    .sort((a, b) => b.count - a.count);
