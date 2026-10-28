import { describe, expect, it } from "vitest";
import type { KnownItem } from "./known-items";
import { groupOf, wordSample } from "./word-sample";

const word = (characters: string, partsOfSpeech: string[]): KnownItem => ({
  type: "vocabulary",
  characters,
  meaning: characters,
  partsOfSpeech,
});
const many = (prefix: string, n: number, pos: string[]) =>
  Array.from({ length: n }, (_, i) => word(`${prefix}${i}`, pos));

describe("groupOf", () => {
  it.each([
    [["noun"], "noun"],
    [["proper noun"], "noun"],
    [["godan verb", "transitive verb"], "verb"],
    [["ichidan verb"], "verb"],
    [["する verb"], "verb"],
    [["verbal noun"], "verb"],
    [["い adjective"], "adjective"],
    [["な adjective"], "adjective"],
    [["の adjective"], "adjective"],
    [["adverb"], "adverb"],
    [["suffix"], "other"],
    [[], "other"],
  ])("%j is %s", (pos, group) => expect(groupOf(pos)).toBe(group));

  it("takes the first group in order", () => {
    expect(groupOf(["な adjective", "noun"])).toBe("noun");
    expect(groupOf(["adverb", "する verb"])).toBe("verb");
  });
});

describe("wordSample", () => {
  it("takes 30 words from each group", () => {
    const items = [
      ...many("n", 50, ["noun"]),
      ...many("v", 50, ["godan verb"]),
      ...many("a", 50, ["い adjective"]),
      ...many("d", 50, ["adverb"]),
      ...many("o", 50, ["suffix"]),
    ];
    const { sample } = wordSample(items);
    expect(sample).toHaveLength(150);
    for (const p of "nvado")
      expect(sample.filter((w) => w.characters.startsWith(p))).toHaveLength(30);
  });

  it("fills short groups from the other words", () => {
    const items = [...many("n", 200, ["noun"]), ...many("d", 5, ["adverb"])];
    const { sample } = wordSample(items);
    expect(sample).toHaveLength(150);
    expect(sample.filter((w) => w.characters.startsWith("d"))).toHaveLength(5);
    expect(new Set(sample.map((w) => w.characters)).size).toBe(150);
  });

  it("returns every word when there are fewer than the sample size", () => {
    expect(wordSample(many("n", 40, ["noun"])).sample).toHaveLength(40);
  });

  it("leaves kanji out of the words and joins them into one string", () => {
    const items: KnownItem[] = [
      ...many("n", 3, ["noun"]),
      { type: "kanji", characters: "日", meaning: "sun", partsOfSpeech: [] },
      { type: "kanji", characters: "本", meaning: "book", partsOfSpeech: [] },
    ];
    const { sample, kanji } = wordSample(items);
    expect(sample).toHaveLength(3);
    expect(kanji).toBe("日本");
  });
});
