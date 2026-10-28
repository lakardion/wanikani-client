import { expect, it } from "vitest";
import { furigana } from "./reading";

const t = (surface: string, reading?: string) => ({ surface, reading });

it("puts the hiragana reading over the kanji only", () => {
  expect(
    furigana([t("東京", "トウキョウ"), t("へ", "ヘ"), t("行っ", "イッ"), t("た", "タ")]),
  ).toEqual([
    { text: "東京", ruby: "とうきょう" },
    { text: "へ" },
    { text: "行", ruby: "い" },
    { text: "っ" },
    { text: "た" },
  ]);
});

it("splits a reading around kana inside a word", () => {
  expect(furigana([t("取り消し", "トリケシ")])).toEqual([
    { text: "取", ruby: "と" },
    { text: "り" },
    { text: "消", ruby: "け" },
    { text: "し" },
  ]);
});

it("shows no reading for tokens without one", () => {
  expect(furigana([t("ABC", "*"), t("猫")])).toEqual([{ text: "ABC" }, { text: "猫" }]);
});

it("keeps katakana words without a reading", () => {
  expect(furigana([t("ツリー", "ツリー")])).toEqual([{ text: "ツリー" }]);
});

it("overrides counter words that span several tokens", () => {
  expect(furigana([t("一", "イチ"), t("人", "ニン"), t("で", "デ")])).toEqual([
    { text: "一人", ruby: "ひとり" },
    { text: "で" },
  ]);
  expect(furigana([t("一つ", "ヒトツ")])).toEqual([{ text: "一", ruby: "ひと" }, { text: "つ" }]);
});

it("prefers the longest override", () => {
  expect(furigana([t("二", "ニ"), t("十", "ジュウ"), t("日", "ニチ")])).toEqual([
    { text: "二十日", ruby: "はつか" },
  ]);
  expect(furigana([t("二", "ニ"), t("日", "ニチ")])).toEqual([{ text: "二日", ruby: "ふつか" }]);
});

it("does not override across a partial token", () => {
  expect(furigana([t("一人前", "イチニンマエ")])).toEqual([
    { text: "一人前", ruby: "いちにんまえ" },
  ]);
});

it("puts the whole reading over the word when the kana do not line up", () => {
  expect(furigana([t("行っ", "オコナウ")])).toEqual([{ text: "行っ", ruby: "おこなう" }]);
});
