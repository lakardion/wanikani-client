/**
 * PROTOTYPE: the v1 session loop in a terminal. Endless; one retry or give up, then the full explanation.
 * Run from the repo root: `bun prototypes/exercise-prompts/play.ts [model]`. Ctrl+C to stop.
 */
import { createInterface } from "node:readline/promises";
import { randomGrammar } from "./grammar";
import { knownKanji, loadKnownItems, wordSample } from "./known";
import { generateExercise, gradeAnswer, MODELS } from "./prompts";

const model = process.argv[2] ?? MODELS[0]!;
const rl = createInterface({ input: process.stdin, output: process.stdout });
const items = await loadKnownItems();
const kanji = knownKanji(items);
const tally = { passed: 0, attempted: 0 };

while (true) {
  const grammar = randomGrammar();
  console.log(`\nGenerating with ${model}…`);
  const g = await generateExercise({ sample: wordSample(items), kanji, grammar, model });
  console.log(`\n[${grammar.pattern}] (${g.ms} ms${g.violations.length ? `, KANJI VIOLATIONS: ${g.violations.join("")}` : ""})`);
  console.log(`  ${g.exercise.japanese}`);
  let passed = false;
  for (let attempt = 1; attempt <= 2 && !passed; attempt++) {
    const answer = await rl.question(`${attempt === 1 ? "Translate" : "Retry"} (? or empty to give up) > `);
    if (!answer.trim() || answer.trim() === "?") break;
    console.log("  Grading…");
    const r = await gradeAnswer({ exercise: g.exercise, grammar, answer, model });
    passed = r.pass;
    console.log(`  ${r.pass ? "PASS" : "FAIL"} ${r.score}/100 — ${r.feedback} (${r.ms} ms)`);
  }
  const e = g.exercise;
  console.log(`\n  Answer: ${e.english}\n  Reading: ${e.reading}\n\n  Breakdown:`);
  for (const w of e.breakdown) console.log(`    ${w.text} (${w.reading}) — ${w.meaning}`);
  console.log(`\n  Grammar: ${e.grammarExplanation}\n\n  Example: ${e.example.japanese}\n           ${e.example.english}\n`);
  tally.attempted++;
  if (passed) tally.passed++;
  console.log(`  Session: ${tally.passed}/${tally.attempted} passed`);
  await rl.question("Enter for next > ");
}
