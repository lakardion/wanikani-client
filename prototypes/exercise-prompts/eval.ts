/**
 * PROTOTYPE: generation + grading eval against both candidate models.
 * Run from the repo root: `bun prototypes/exercise-prompts/eval.ts [runs] [--gen-only]`. Writes out/report.md and out/raw.json.
 */
import { writeFileSync } from "node:fs";
import { GRAMMAR } from "./grammar";
import { knownKanji, loadKnownItems, posReport, wordSample } from "./known";
import { generateExercise, gradeAnswer, MODELS } from "./prompts";

const RUNS = Number(process.argv[2] ?? 20);
const GEN_ONLY = process.argv.includes("--gen-only");
const GRADE_REPS = 2;
const out = (f: string) => new URL(`./out/${f}`, import.meta.url).pathname;

/** Fixed grading cases: [answer, min, max] bands are the expected score range. */
const GRADE_CASES: { japanese: string; english: string; grammar: string; answers: [string, number, number][] }[] = [
  { japanese: "昨日、友達と映画を見に行きました。", english: "Yesterday I went to see a movie with a friend.", grammar: "n5-ni-iku", answers: [
    ["I went to watch a film with my friend yesterday.", 90, 100],
    ["Yesterday I went to see a movie.", 70, 89],
    ["Tomorrow I will go see a movie with a friend.", 40, 69],
    ["I like eating apples.", 0, 39],
  ] },
  { japanese: "窓を開けてもいいですか。", english: "May I open the window?", grammar: "n5-te-mo-ii", answers: [
    ["Is it ok if I open the window?", 90, 100],
    ["Please open the window.", 40, 69],
    ["I opened the window.", 0, 49],
  ] },
  { japanese: "雨が降っているから、家にいます。", english: "Because it is raining, I am staying at home.", grammar: "n5-kara-reason", answers: [
    ["I'm staying home since it's raining", 90, 100],
    ["It is raining and I am at home", 60, 89],
    ["Because it isn't raining, I'm staying home.", 40, 69],
  ] },
  { japanese: "この本は読みやすいです。", english: "This book is easy to read.", grammar: "n4-yasui-nikui", answers: [
    ["this book is easy to raed", 90, 100],
    ["This book is hard to read.", 0, 49],
    ["This book is interesting.", 20, 60],
  ] },
  { japanese: "先生に褒められました。", english: "I was praised by the teacher.", grammar: "n4-passive", answers: [
    ["The teacher praised me.", 90, 100],
    ["I praised the teacher.", 0, 49],
  ] },
  { japanese: "日本に行ったことがあります。", english: "I have been to Japan.", grammar: "n4-ta-koto-ga-aru", answers: [
    ["I have gone to Japan before", 90, 100],
    ["I went to Japan.", 60, 89],
    ["I want to go to Japan.", 0, 49],
  ] },
  { japanese: "寝る前に歯を磨いてください。", english: "Please brush your teeth before going to bed.", grammar: "n5-mae-ni", answers: [
    ["Brush your teeth before you sleep, please.", 90, 100],
    ["Please brush your teeth after going to bed.", 40, 69],
    ["", 0, 10],
  ] },
  { japanese: "薬を飲まなければなりません。", english: "I have to take medicine.", grammar: "n4-nakereba-naranai", answers: [
    ["I must take my medicine.", 90, 100],
    ["I have to drink medicine", 85, 100],
    ["I don't have to take medicine.", 0, 49],
  ] },
];

const items = await loadKnownItems();
const kanji = knownKanji(items);
const words = items.filter((i) => i.type !== "kanji").length;
console.log(`known: ${words} words, ${kanji.length} kanji`);

/** Same sample and grammar go to every model, so the comparison is paired. */
const gen: Awaited<ReturnType<typeof generateExercise>>[] = [];
for (let i = 0; i < RUNS; i++) {
  const sample = wordSample(items);
  const grammar = GRAMMAR[i % GRAMMAR.length]!;
  const pair = await Promise.all(
    Object.values(MODELS).map((model) =>
      generateExercise({ sample, kanji, grammar, model }).catch((e) => ({ model, grammar: grammar.id, error: String(e) }) as any),
    ),
  );
  gen.push(...pair);
  console.log(`gen ${i + 1}/${RUNS}`);
}

const grade: any[] = [];
for (const c of GEN_ONLY ? [] : GRADE_CASES) {
  const grammar = GRAMMAR.find((g) => g.id === c.grammar)!;
  for (const [answer, min, max] of c.answers)
    for (const model of Object.values(MODELS)) {
      const scores = await Promise.all(
        Array.from({ length: GRADE_REPS }, () => gradeAnswer({ exercise: c, grammar, answer, model }).catch((e) => ({ error: String(e) }) as any)),
      );
      grade.push({ model, japanese: c.japanese, answer, min, max, results: scores });
    }
  console.log(`grade ${c.japanese}`);
}

writeFileSync(out("raw.json"), JSON.stringify({ gen, grade }, null, 2));

const median = (xs: number[]) => xs.sort((a, b) => a - b)[Math.floor(xs.length / 2)] ?? 0;
const cost = (rs: any[]) => (rs.reduce((s, r) => s + (r.cost ?? 0), 0) / (rs.length || 1)).toFixed(6);
const md: string[] = [`# Exercise prompt eval\n`, `Known: ${words} words, ${kanji.length} kanji. Generation runs per model: ${RUNS}. Grading reps per answer: ${GRADE_REPS}.\n`];

md.push(`## Generation summary\n`, `| Model | Errors | Kanji-clean | Median ms | Avg in tok | Avg out tok | Avg cost $ | Providers |`, `|---|---|---|---|---|---|---|---|`);
for (const model of Object.values(MODELS)) {
  const rs = gen.filter((r) => r.model === model);
  const ok = rs.filter((r) => !("error" in r));
  const avg = (f: (r: any) => number) => Math.round(ok.reduce((s, r) => s + (f(r) ?? 0), 0) / (ok.length || 1));
  md.push(`| ${model} | ${rs.length - ok.length} | ${ok.filter((r) => r.violations.length === 0).length}/${ok.length} | ${median(ok.map((r) => r.ms))} | ${avg((r) => r.usage.inputTokens)} | ${avg((r) => r.usage.outputTokens)} | ${cost(ok)} | ${[...new Set(ok.map((r) => r.provider))].join(", ")} |`);
}

md.push(`\n## Generated sentences (judge naturalness and grammar use)\n`);
for (let i = 0; i < gen.length; i += MODELS.length) {
  md.push(`### ${i / MODELS.length + 1}. ${gen[i].grammar}\n`);
  for (const r of gen.slice(i, i + MODELS.length)) {
    if ("error" in r) { md.push(`- **${r.model}**: ERROR ${r.error}`); continue; }
    md.push(`- **${r.model}**: ${r.exercise.japanese} (${r.exercise.reading})`, `  - EN: ${r.exercise.english}`, `  - Grammar: ${r.exercise.grammarExplanation}`, `  - Example: ${r.exercise.example.japanese} (${r.exercise.example.english})`, `  - kanji violations: ${r.violations.join("") || "none"}; ${r.ms} ms`);
  }
  md.push("");
}

if (!GEN_ONLY) {
md.push(`## Grading\n`, `| Model | In band | Max spread between reps | Median ms | Avg cost $ |`, `|---|---|---|---|---|`);
for (const model of Object.values(MODELS)) {
  const rs = grade.filter((g) => g.model === model);
  const all = rs.flatMap((g) => g.results.filter((x: any) => !x.error).map((x: any) => ({ ...x, min: g.min, max: g.max })));
  const spread = Math.max(...rs.map((g) => { const s = g.results.filter((x: any) => !x.error).map((x: any) => x.score); return s.length < 2 ? 0 : Math.max(...s) - Math.min(...s); }));
  md.push(`| ${model} | ${all.filter((x) => x.score >= x.min && x.score <= x.max).length}/${all.length} | ${spread} | ${median(all.map((x: any) => x.ms))} | ${cost(all)} |`);
}
md.push(`\n| Model | Japanese | Answer | Band | Scores | Feedback (rep 1) |`, `|---|---|---|---|---|---|`);
for (const g of grade)
  md.push(`| ${g.model} | ${g.japanese} | ${g.answer || "(empty)"} | ${g.min}–${g.max} | ${g.results.map((x: any) => x.score ?? "ERR").join(", ")} | ${(g.results[0].feedback ?? g.results[0].error ?? "").replaceAll("|", "/")} |`);
}

md.push(`\n## WaniKani POS strings\n`, `| POS | Count | Group |`, `|---|---|---|`, ...posReport(items).map((p) => `| ${p.pos} | ${p.count} | ${p.group} |`));

writeFileSync(out("report.md"), md.join("\n"));
console.log(`wrote ${out("report.md")}`);
