# Exercise prompt eval

Known: 2370 words, 684 kanji. Generation runs per model: 10. Grading reps per answer: 2.

## Generation summary

| Model | Errors | Kanji-clean | Median ms | Avg in tok | Avg out tok |
|---|---|---|---|---|---|
| nvidia/nemotron-3.5-super-vl:free | 0 | 10/10 | 64916 | 2113 | 11037 |

## Generated sentences (judge naturalness and grammar use)

### 1. n5-desu

- **nvidia/nemotron-3.5-super-vl:free**: 私の母は内ではありません。 (わたしのははうちではありません。)
  - EN: My mother is not inside.
  - Grammar: 〜です is the polite copula meaning “is/am/are,” and it follows nouns or na-adjectives. 〜ではありません is the polite negative form, meaning “is not.” It attaches directly to a noun to negate a state or identity. Here it follows 内 (inside) to say that the speaker’s mother is not inside.
  - Example: あなたは内ではありません。 (You are not inside.)
  - kanji violations: none; 64916 ms

### 2. n5-masu-past

- **nvidia/nemotron-3.5-super-vl:free**: 本当に大学に合格しました。 (ほんとうにだいがくにごうかくしました。)
  - EN: I really got accepted to the university.
  - Grammar: 〜ました is the polite past affirmative ending; 〜ませんでした is the polite past negative. Attach it to the masu-stem of a verb (or use しました for suru verbs like 合格する). It shows the action happened in the past and is used in polite speech.
  - Example: 文章を書きませんでした。 (I didn't write the essay.)
  - kanji violations: none; 49600 ms

### 3. n5-tai

- **nvidia/nemotron-3.5-super-vl:free**: 私自身は今すぐ急ぎたい。 (わたしじしんはいますぐいそぎたい)
  - EN: I personally want to hurry right away.
  - Grammar: 〜たい means "want to do" and attaches to a verb’s masu-stem. To form it, drop ます from the polite form and add たい (e.g., 急ぎます → 急ぎたい). It expresses the speaker’s own desire and conjugates like an i-adjective. In this sentence, 急ぐ becomes 急ぎたい, meaning "want to hurry."
  - Example: 俺たちは走り回りたい。 (We want to run around.)
  - kanji violations: none; 93333 ms

### 4. n5-te-kudasai

- **nvidia/nemotron-3.5-super-vl:free**: 先ず作文を手伝ってください (まずぶんさくをてつだってください)
  - EN: First, please help me with my composition.
  - Grammar: 〜てください is a polite way to ask someone to do something. It is formed by attaching ください to the te-form of a verb. In this sentence, 手伝う (“to help”) becomes 手伝って, and adding ください makes it “please help.” This is a basic JLPT N5 request pattern.
  - Example: 作文を見せてください (Please show me your composition.)
  - kanji violations: none; 102483 ms

### 5. n5-te-iru

- **nvidia/nemotron-3.5-super-vl:free**: 社員は休んでいます。 (しゃいんはやすんでいます。)
  - EN: The company employee is resting.
  - Grammar: 〜ている indicates an action in progress or a continuing state. It is formed by taking a verb’s te-form and adding いる (or います for polite speech). Here, 休む (“to rest”) becomes 休んで, so 休んでいます means “is resting.”
  - Example: 子はもう服を着ている。 (The child is already wearing clothes.)
  - kanji violations: none; 53408 ms

### 6. n5-te-mo-ii

- **nvidia/nemotron-3.5-super-vl:free**: この部屋で休んでもいいですか。 (このへやでやんでもいいですか。)
  - EN: May I rest in this room?
  - Grammar: 〜てもいい means “it is okay to ~” or “may I ~?” and is used to ask for or give permission. It is formed by adding もいい to the te-form of a verb; in polite speech, say いいですか or いいです. Here, 休む (to rest) becomes 休んで, then 休んでもいいですか asks whether resting here is allowed.
  - Example: ここで集まってもいいですか。 (May we gather here?)
  - kanji violations: none; 56928 ms

### 7. n5-te-wa-ikenai

- **nvidia/nemotron-3.5-super-vl:free**: 食堂で走ってはいけない。 (しょくどうではしってはいけない。)
  - EN: You must not run in the cafeteria.
  - Grammar: 〜てはいけない means "must not" or "is not allowed." It is formed by taking the te-form of a verb and adding は + いけない. In this sentence, 走って is the te-form of 走る ("to run"), so it says that running in the cafeteria is prohibited.
  - Example: 川で泳いではいけない。 (You must not swim in the river.)
  - kanji violations: none; 33903 ms

### 8. n5-mashou

- **nvidia/nemotron-3.5-super-vl:free**: 皆さん、今すぐ帰りましょう。 (みなさん、いますぐかえりましょう。)
  - EN: Everyone, let's go home at once.
  - Grammar: 〜ましょう is a polite volitional ending meaning “let’s do.” It is formed from the masu-stem of a verb plus ましょう, and it invites the listener to do something together with the speaker. Here, 帰ります becomes 帰り, then 帰りましょう to suggest going home together.
  - Example: 必ず約束をしましょう。 (Let's definitely make a promise.)
  - kanji violations: none; 85454 ms

### 9. n5-masenka

- **nvidia/nemotron-3.5-super-vl:free**: ここで注文しませんか。 (ここでちゅうもんしませんか。)
  - EN: Won't you order here?
  - Grammar: 〜ませんか is formed by adding か to the negative polite form 〜ません, and it is used to make a friendly invitation meaning “Won’t you…?” or “Shall we…?”. For suru verbs like 注文する, the stem is 注文, so it becomes 注文しませんか. It is a polite way to invite someone to do something together or to offer them the chance to act. Here, the speaker invites the listener to place an order at this place.
  - Example: ここで今すぐ食べませんか。 (Won't you eat here right away?)
  - kanji violations: none; 96293 ms

### 10. n5-kara-reason

- **nvidia/nemotron-3.5-super-vl:free**: 古いから、それを食べません。 (ふるいから、それをたべません。)
  - EN: Because it's old, I won't eat it.
  - Grammar: 〜から means "because" and introduces a reason for the main clause. It attaches to the plain form of verbs, adjectives, and nouns. Here it follows the i-adjective 古い ("old") to explain why the speaker won't eat the item.
  - Example: 静かだから、働きます。 (Because it's quiet, I will work.)
  - kanji violations: none; 60146 ms


## WaniKani POS strings

| POS | Count | Group |
|---|---|---|
| noun | 1728 | noun |
| の adjective | 337 | adjective |
| verbal noun | 249 | verb |
| godan verb | 203 | verb |
| transitive verb | 190 | verb |
| な adjective | 147 | adjective |
| intransitive verb | 142 | verb |
| ichidan verb | 109 | verb |
| suffix | 81 | other |
| adverb | 80 | adverb |
| い adjective | 72 | adjective |
| する verb | 41 | verb |
| numeral | 38 | other |
| expression | 35 | other |
| proper noun | 27 | noun |
| pronoun | 25 | other |
| counter | 13 | other |
| こそあど word | 12 | other |
| independent noun | 6 | noun |
| adjective | 5 | adjective |
| prefix | 4 | other |
| オノマトペ | 3 | other |
| interjection | 2 | other |
| conjunction | 2 | other |