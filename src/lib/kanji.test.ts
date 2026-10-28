import { expect, it } from "vitest";
import { kanjiViolations } from "./kanji";

it("lists each kanji that is not allowed, once", () => {
  expect(kanjiViolations("日本語を勉強します。日本", "日本")).toEqual(["語", "勉", "強"]);
});

it("ignores kana, latin and punctuation", () => {
  expect(kanjiViolations("ひらがな カタカナ abc、。", "")).toEqual([]);
});
