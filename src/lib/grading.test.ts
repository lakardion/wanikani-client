import { expect, it } from "vitest";
import { isGiveUp, isPass } from "./grading";

it.each(["", "   ", "?", " ? "])("%j is a give up", (answer) => {
  expect(isGiveUp(answer)).toBe(true);
});

it.each(["??", "I eat", "? maybe"])("%j is an answer", (answer) => {
  expect(isGiveUp(answer)).toBe(false);
});

it("passes at 70 and above", () => {
  expect(isPass(69)).toBe(false);
  expect(isPass(70)).toBe(true);
  expect(isPass(100)).toBe(true);
});
