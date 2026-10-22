# Exercise prompt eval

Known: 2370 words, 684 kanji. Generation runs per model: 20. Grading reps per answer: 2.

## Generation summary

| Model | Errors | Kanji-clean | Anchors hit (of 2) | Median ms | Avg in tok | Avg out tok |
|---|---|---|---|---|---|---|
| nvidia/nemotron-3.5-super-vl:free | 2 | 18/18 | 1.94 | 126204 | 2120 | 14070 |
| xingchen-agi/xing4.0-29b-a4b:free | 14 | 5/6 | 1.33 | 9713 | 1981 | 305 |

## Generated sentences (judge naturalness and grammar use)

### 1. n5-desu — anchors 名字、フランス語

- **nvidia/nemotron-3.5-super-vl:free**: 私の名字はフランス語ではありません。 (わたしのみょうじはふらんすごではありません。)
  - EN: My surname is not French.
  - Grammar: 〜です is the polite copula meaning "is/am/are." Its polite negative form is 〜ではありません, meaning "is not." You attach it directly to a noun, as in 名字 + ではありません. Here it politely denies that the surname is French.
  - Example: これは事実ではありません。 (This is not a fact.)
  - kanji violations: none; anchors hit 2/2; 56218 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: 静々、私の名前は田中です。 (静々、私の名前は田中です。)
  - EN: Quietly, my name is Tanaka.
  - Grammar: です and ではありません are the polite equivalents of だ and ではない. The copula dictionary form です connects a topic or subject to its predicate. Here, です follows the noun 名前 (name) to make a simple statement that 'my name is Tanaka.' The topic marker は first establishes the topic, then です states what the topic is.
  - Example: 私の名前は田中ではありません。 (My name is not Tanaka.)
  - kanji violations: none; anchors hit 1/2; 7606 ms

### 2. n5-masu-past — anchors 囲む、特選

- **nvidia/nemotron-3.5-super-vl:free**: 俺たちで特選を囲みました。 (おれたちでとくせんをかこみました。)
  - EN: We gathered around the special selection.
  - Grammar: 〜ました is the polite past affirmative ending. It is added to the masu-stem of a verb to show that an action was completed in the past. For the verb 囲む, the stem is 囲み, so it becomes 囲みました. Here it describes the group gathering around the special selection.
  - Example: ここで彼らに会いました。 (I met them here.)
  - kanji violations: none; anchors hit 2/2; 61725 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_NoObjectGeneratedError: No object generated: could not parse the response.

### 3. n5-tai — anchors 注文する、受け取る

- **nvidia/nemotron-3.5-super-vl:free**: コンビニで焼き芋を注文して受け取りたいです。 (コンビニでやきいもをちゅうもんしてうけとりたいです。)
  - EN: I want to order a baked sweet potato at the convenience store and receive it.
  - Grammar: 〜たい expresses wanting to do an action. It is attached to the masu-stem of a verb. Here, it attaches to 受け取り (from 受け取る) to make 受け取りたい, meaning “want to receive.” The subject is implied to be “I.”
  - Example: 麦を売りたいです。 (I want to sell wheat.)
  - kanji violations: none; anchors hit 1/2; 84791 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_NoObjectGeneratedError: No object generated: could not parse the response.

### 4. n5-te-kudasai — anchors ?

- **nvidia/nemotron-3.5-super-vl:free**: ERROR AI_NoOutputGeneratedError: No output generated.
- **xingchen-agi/xing4.0-29b-a4b:free**: 参加してください。 (さんかしてください。)
  - EN: Please participate.
  - Grammar: The particle て connects verbs, and ください attaches to the te-form base (し). Together they mean "please do (verb)". In this sentence, 参加 (participation) becomes 参加してください ("please participate").
  - Example: 来てください。 (Please come.)
  - kanji violations: none; anchors hit 1/2; 9713 ms

### 5. n5-te-iru — anchors 実力、悲しい

- **nvidia/nemotron-3.5-super-vl:free**: 私は実力を信じているのに、悲しい。 (わたしはじつりょくをしんじているのに、かなしい。)
  - EN: Even though I believe in my true strength, I am sad.
  - Grammar: 〜ている is formed by attaching いる to a verb’s te-form. It shows an action in progress or a continuing state. 信じる (to believe) becomes 信じている, meaning “I believe” as a continuing state of mind. のに adds the meaning “despite” or “even though,” contrasting the ongoing belief with the speaker’s sadness.
  - Example: 私は夏に勉強している。 (I am studying in the summer.)
  - kanji violations: none; anchors hit 2/2; 288211 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 6. n5-te-mo-ii — anchors 勝つ、決める

- **nvidia/nemotron-3.5-super-vl:free**: 勝ってもいいか、後で決める。 (かってもいいか、あとできめる。)
  - EN: I’ll decide later whether it’s okay to win.
  - Grammar: 〜てもいい means “may do” or “it is okay to do.” It is formed by taking a verb’s te-form and adding も + いい. In this sentence, 勝って (the te-form of 勝つ) is used with もいいか to indirectly ask whether winning is permitted.
  - Example: あの子に入ってもいい。 (That child may enter.)
  - kanji violations: none; anchors hit 2/2; 126204 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 7. n5-te-wa-ikenai — anchors 切る、下げる

- **nvidia/nemotron-3.5-super-vl:free**: ここでは、座席を下げてはいけないし、毛を切ってはいけない。 (ここでは、ざせきをさげてはいけないし、けをきってはいけない。)
  - EN: Here, you must not lower the seat, and you must not cut the hair.
  - Grammar: 〜てはいけない means “must not do something” or “it is not allowed to do something.” It is formed by adding はいけない to the te-form of a verb. In this sentence, it is attached to 下げて (“lower”) and 切って (“cut”) to prohibit both actions.
  - Example: ここでは、品を出してはいけない。 (You must not take out the article here.)
  - kanji violations: none; anchors hit 2/2; 92906 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 8. n5-mashou — anchors 必死、生

- **nvidia/nemotron-3.5-super-vl:free**: 必死で生を学びましょう。 (ひっしでなまをまなびましょう。)
  - EN: Let's frantically learn about life.
  - Grammar: 〜ましょう means "let's do" and is formed by attaching ましょう to a verb's ます-stem. Here, 学ぶ (to learn) becomes 学びましょう (let's learn). 必死で is an adverb meaning "frantically" and describes how the action is done.
  - Example: 必死で勉強しましょう。 (Let's study frantically.)
  - kanji violations: none; anchors hit 2/2; 468368 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 9. n5-masenka — anchors 仮に、着る

- **nvidia/nemotron-3.5-super-vl:free**: 仮に、正月にこれを着ませんか。 (かりに、しょうがつにこれをきませんか。)
  - EN: Suppose it’s for New Year’s—won’t you wear this?
  - Grammar: 〜ませんか is made from the polite negative form of a verb plus か, and it is used to issue a friendly invitation, like “Won’t you…?” Here, 着る (“to wear”) becomes 着ません (“won’t wear”), and adding か turns it into “won’t you wear?” 仮に (“supposing”) sets up a hypothetical situation, so the speaker imagines a context (New Year’s) before inviting the listener.
  - Example: 皆様、参加しませんか。 (Everyone, won’t you participate?)
  - kanji violations: none; anchors hit 2/2; 119689 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: 仸に着るませんか (かりにきるませんか)
  - EN: Won't you wear that?
  - Grammar: The form わどりが割つくない (kam dash ka) is used at the end of a sentence to politely ask someone what they think or if they would like to do something. It is formed by adding わどか (masen ka) to the dictionary form verb. In this sentence, it asks the listener if they would like to put on some clothing.
  - Example: 仸に着るませんか (Won't you wear your jacket?)
  - kanji violations: 仸; anchors hit 1/2; 11585 ms

### 10. n5-kara-reason — anchors 布地、湯

- **nvidia/nemotron-3.5-super-vl:free**: この布地が湯で重いから、両手で下げる。 (このふちがゆでおもいから、りょうてでさげる。)
  - EN: Because this cloth is heavy with hot water, I lower it with both hands.
  - Grammar: 〜から means "because" and attaches to the plain form of verbs, adjectives, and nouns. With i-adjectives like 重い, you simply add から directly. Here it gives the reason for the action in the second clause: lowering the cloth with both hands.
  - Example: これは湯だから、温かい。 (Because this is hot water, it is warm.)
  - kanji violations: none; anchors hit 2/2; 324053 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 11. n5-ga-but — anchors 社内、参る

- **nvidia/nemotron-3.5-super-vl:free**: 社内は小さいが、皆様が参ります。 (しゃないはちいさいが、みなさまがまいります。)
  - EN: The office is small, but everyone is coming.
  - Grammar: The conjunction 〜が connects two clauses and means "but" or "however." It comes at the end of the first clause, after adjectives, verbs, or nouns. In this sentence, it contrasts the small office with the fact that everyone is coming. This is different from the subject particle が, which marks the subject of the second clause.
  - Example: 社内は古いが、参ります。 (The office is old, but I am coming.)
  - kanji violations: none; anchors hit 2/2; 64942 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 12. n5-mae-ni — anchors ?

- **nvidia/nemotron-3.5-super-vl:free**: ERROR AI_NoOutputGeneratedError: No output generated.
- **xingchen-agi/xing4.0-29b-a4b:free**: 〜まえに余る (まえに余る)
  - EN: There is a surplus before...
  - Grammar: The grammar 〜まえに is used to indicate something that happens or exists before an action or event. It connects to the verb 余る (to be in surplus) to express 'there is surplus before...' in a natural sentence structure.
  - Example: まだまえに余った (It was surplus before...)
  - kanji violations: none; anchors hit 1/2; 13034 ms

### 13. n5-te-kara — anchors 引き算、七

- **nvidia/nemotron-3.5-super-vl:free**: 引き算を七つ勉強してから、走り回ります。 (ひきざんをななつべんきょうしてから、はしりまわります。)
  - EN: After studying seven subtraction problems, I run around.
  - Grammar: 〜てから means “after doing” and shows that one action finishes before the next begins. It is formed by taking the te-form of a verb and adding から. In this sentence, 勉強して (studying) happens first, and then 走り回ります (running around) happens.
  - Example: 走り回ってから、勉強します。 (After running around, I study.)
  - kanji violations: none; anchors hit 2/2; 178259 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 14. n5-tari-tari — anchors 青い、生保

- **nvidia/nemotron-3.5-super-vl:free**: 毎晩、生保を調べたり、青い箱を整理したりする。 (まいばん、せいほをしらべたり、あおいはこをせいりしたりする。)
  - EN: Every night, I do things like look into life insurance and organize a blue box.
  - Grammar: 〜たり〜たりする lists example actions, meaning “do things like A and B.” Verbs are changed to their past (た) form, then り is added, and the sentence ends with する. It does not give a complete list, just representative examples.
  - Example: 毎晩、女の子が集まったり、走り回ったりする。 (Every night, girls do things like gather and run around.)
  - kanji violations: none; anchors hit 2/2; 149635 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 15. n5-nai-de-kudasai — anchors 来年、作文

- **nvidia/nemotron-3.5-super-vl:free**: 来年の作文をまだ作らないでください。 (らいねんのさくぶんをまだつくらないでください)
  - EN: Please don't write next year's composition yet.
  - Grammar: 〜ないでください means "please do not..." and is used to make a negative request. It is formed by taking a verb's ない-form and adding でください. In this sentence, 作る (to write/create) becomes 作らない, and 作らないでください politely asks the listener not to write the composition yet.
  - Example: 来年、うんてんしないでください。 (Please don't drive next year.)
  - kanji violations: none; anchors hit 2/2; 100682 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: 来年、作文を作らないでください。 (らいねん、作文をつくらないでください。)
  - EN: Please don't make your composition next year.
  - Grammar: The target grammar 〜ないでください attaches to the dictionary-form negative (〜ない) before the verb stem, and adds ください at the end to make a polite request meaning 'please do not ...'. In this sentence, 作る becomes the negative stem 作ら and combines with ないで to form 作らないで, then ください follows to request that the listener does not create a composition. This pattern is commonly used in everyday Japanese for politeness when making requests.
  - Example: これを書いてください。 (Please write this.)
  - kanji violations: none; anchors hit 2/2; 5677 ms

### 16. n5-yori — anchors 写る、決まる

- **nvidia/nemotron-3.5-super-vl:free**: 写るのは、決まるのよりとても早い。 (うつるのは、きまるのよりとてもはやい。)
  - EN: Getting photographed is much earlier than being decided.
  - Grammar: AはBより〜 means “A is more ~ than B” and compares two things. Here, the verbs 写る and 決まる are turned into noun phrases with the particle の so they can fill the A and B slots. とても emphasizes the adjective 早い (“early”), so the sentence says that being photographed happens much sooner than being decided.
  - Example: 大根は一個よりとても重い。 (A daikon is much heavier than one small thing.)
  - kanji violations: none; anchors hit 2/2; 179793 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_NoObjectGeneratedError: No object generated: could not parse the response.

### 17. n5-ichiban — anchors 姉妹、生える

- **nvidia/nemotron-3.5-super-vl:free**: 姉妹で、かみがいちばん生える。 (しまいで、かみがいちばんはえる。)
  - EN: Among sisters, hair grows the most.
  - Grammar: 〜がいちばん means "the most" and is used for superlatives. The item being compared is marked with が, and いちばん comes before the adjective or verb. In this sentence, かみがいちばん生える means "hair grows the most," and 姉妹で sets the group as "among sisters."
  - Example: これがいちばん小さい。 (This is the smallest.)
  - kanji violations: none; anchors hit 2/2; 222910 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 18. n5-ni-iku — anchors 民族、一万

- **nvidia/nemotron-3.5-super-vl:free**: 一万で民族を支えにいく。 (いちまんでみんぞくをささえにいく。)
  - EN: I’m going to go support the ethnic group with 10,000 yen.
  - Grammar: 〜にいく means “go to do something” and expresses the purpose of going. It is formed by attaching にいく to the masu-stem of a verb. In this sentence, 支える becomes 支え, so 支えにいく means “go to support.” The particle に marks the purpose of the action.
  - Example: しあいを見直しにいく。 (I’m going to go reevaluate the match.)
  - kanji violations: none; anchors hit 2/2; 130644 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: 一万の民族が来たよ！ (いちまんのめみょうがきたよ！)
  - EN: A hundred thousand ethnic groups came here!
  - Grammar: The target grammar "〜にいく" expresses going to a place or doing an action for a purpose. Here, the base verb is "来る" (to come), which uses the same grammatical pattern — adding "に" before the dictionary form verb to indicate direction/purpose: 「来にいく」 would mean 'going to come.' However, since this sentence focuses on arriving at a place rather than traveling there, the past tense form with an exclamation is more natural in casual speech. The pattern can be used with any motion verb like 行く (go), 来る (come), 帰る (return), etc.
  - Example: 一万の馬が山のふもとにいった。 (Twenty thousand horses went to the foot of the mountain.)
  - kanji violations: none; anchors hit 2/2; 4662 ms

### 19. n5-tsumori — anchors 寺、治安

- **nvidia/nemotron-3.5-super-vl:free**: この辺の寺と治安に役立つつもりです。 (このへんのてらとちあんにやくだつつもりです。)
  - EN: I intend to be useful to the temples and public order around here.
  - Grammar: 〜つもり means “intend to” or “plan to.” It is formed by attaching つもり to the dictionary form of a verb, and is often followed by です for politeness. It expresses the speaker’s own intention or plan. Here, 役立つ + つもりです shows the speaker plans to be useful.
  - Example: 私は寺に行くつもりです。 (I intend to go to the temple.)
  - kanji violations: none; anchors hit 2/2; 67587 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

### 20. n5-deshou — anchors 行う、静か

- **nvidia/nemotron-3.5-super-vl:free**: 明後日の訓練は静かに行うでしょう。 (みょうごにちのくんれんはしずかにおこなうでしょう。)
  - EN: The training the day after tomorrow will probably be carried out quietly.
  - Grammar: 〜でしょう expresses the speaker's assumption or probability, meaning "probably" or "I think." It attaches to the plain form of verbs, adjectives, and nouns. In this sentence, it follows 行う (to carry out), showing that the speaker believes the training will likely be done quietly.
  - Example: 秋の十月はとても寒いでしょう。 (October will probably be very cold.)
  - kanji violations: none; anchors hit 2/2; 61678 ms
- **xingchen-agi/xing4.0-29b-a4b:free**: ERROR AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations

## Grading

| Model | In band | Max spread between reps |
|---|---|---|
| nvidia/nemotron-3.5-super-vl:free | 39/45 | 95 |
| xingchen-agi/xing4.0-29b-a4b:free | 14/18 | 95 |

| Model | Japanese | Answer | Band | Scores | Feedback (rep 1) |
|---|---|---|---|---|---|
| nvidia/nemotron-3.5-super-vl:free | 昨日、友達と映画を見に行きました。 | I went to watch a film with my friend yesterday. | 90–100 | 100, 100 | The meaning is fully correct; only wording differs. |
| xingchen-agi/xing4.0-29b-a4b:free | 昨日、友達と映画を見に行きました。 | I went to watch a film with my friend yesterday. | 90–100 | ERR, ERR | AI_APICallError: xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 昨日、友達と映画を見に行きました。 | Yesterday I went to see a movie. | 70–89 | 80, 80 | You omitted "with a friend" (友達と); the rest of the meaning is correct. |
| xingchen-agi/xing4.0-29b-a4b:free | 昨日、友達と映画を見に行きました。 | Yesterday I went to see a movie. | 70–89 | 80, 75 | The meaning is correct, but 'with a friend' was omitted. The learner should include the companion to match the reference translation. |
| nvidia/nemotron-3.5-super-vl:free | 昨日、友達と映画を見に行きました。 | Tomorrow I will go see a movie with a friend. | 40–69 | 50, 55 | The time and tense are wrong: “Tomorrow” and “will go” change yesterday’s completed action into a future plan. |
| xingchen-agi/xing4.0-29b-a4b:free | 昨日、友達と映画を見に行きました。 | Tomorrow I will go see a movie with a friend. | 40–69 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 昨日、友達と映画を見に行きました。 | I like eating apples. | 0–39 | 10, 0 | The answer is about liking apples rather than going to see a movie with a friend yesterday. |
| xingchen-agi/xing4.0-29b-a4b:free | 昨日、友達と映画を見に行きました。 | I like eating apples. | 0–39 | 10, 0 | Your translation does not match the Japanese at all. The sentence is about going to see a movie yesterday, but your sentence is about liking to eat apples. The key content word (movie/cin-ai) and the overall meaning are completely different. |
| nvidia/nemotron-3.5-super-vl:free | 窓を開けてもいいですか。 | Is it ok if I open the window? | 90–100 | 95, ERR | Correct. Your phrasing accurately asks for permission to open the window. |
| xingchen-agi/xing4.0-29b-a4b:free | 窓を開けてもいいですか。 | Is it ok if I open the window? | 90–100 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 窓を開けてもいいですか。 | Please open the window. | 40–69 | 20, 50 | The meaning is wrong: you translated it as asking someone else to open the window, rather than asking permission to open it yourself. The key error is “Please open,” which reverses who performs the action and misses the 〜てもいい meaning. |
| xingchen-agi/xing4.0-29b-a4b:free | 窓を開けてもいいですか。 | Please open the window. | 40–69 | 40, 0 | The meaning is wrong: 'May I open the window?' uses the polite request form with てもいい, but your sentence is a direct command ('Please open the window'). |
| nvidia/nemotron-3.5-super-vl:free | 窓を開けてもいいですか。 | I opened the window. | 0–49 | 40, 20 | The learner treats 〜てもいいですか as a past-tense statement (“I opened the window”) instead of a request for permission, so the meaning of the target grammar is wrong. |
| xingchen-agi/xing4.0-29b-a4b:free | 窓を開けてもいいですか。 | I opened the window. | 0–49 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 雨が降っているから、家にいます。 | I'm staying home since it's raining | 90–100 | 100, 100 | The meaning is fully preserved; the causal relationship and situation match the Japanese exactly. |
| xingchen-agi/xing4.0-29b-a4b:free | 雨が降っているから、家にいます。 | I'm staying home since it's raining | 90–100 | ERR, 92 | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 雨が降っているから、家にいます。 | It is raining and I am at home | 60–89 | 60, 55 | The facts are correct, but “and” loses the causal meaning of 〜から (“because”). The reason-result relationship is missing. |
| xingchen-agi/xing4.0-29b-a4b:free | 雨が降っているから、家にいます。 | It is raining and I am at home | 60–89 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 雨が降っているから、家にいます。 | Because it isn't raining, I'm staying home. | 40–69 | 50, 45 | The negation “isn’t” is off; the Japanese says it is raining, not that it isn’t. |
| xingchen-agi/xing4.0-29b-a4b:free | 雨が降っているから、家にいます。 | Because it isn't raining, I'm staying home. | 40–69 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | この本は読みやすいです。 | this book is easy to raed | 90–100 | 100, 95 | The meaning is correct; the spelling mistake does not affect the score. |
| xingchen-agi/xing4.0-29b-a4b:free | この本は読みやすいです。 | this book is easy to raed | 90–100 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | この本は読みやすいです。 | This book is hard to read. | 0–49 | 50, 50 | "Hard" is the wrong word here; 読みやすい means "easy to read," not "hard to read." |
| xingchen-agi/xing4.0-29b-a4b:free | この本は読みやすいです。 | This book is hard to read. | 0–49 | 60, ERR | The key word 易い was translated as 'hard' instead of 'easy.' This reverses the meaning. Also, 読みやすい carries a different nu—native (object-oriented, referring to the book itself being easy to read), whereas hard-to-read focuses on difficulty for the reader. The target grammar is correct in structure but inverted. |
| nvidia/nemotron-3.5-super-vl:free | この本は読みやすいです。 | This book is interesting. | 20–60 | 20, 45 | The learner translated 読みやすい as “interesting,” but it means “easy to read,” so the core meaning is wrong. |
| xingchen-agi/xing4.0-29b-a4b:free | この本は読みやすいです。 | This book is interesting. | 20–60 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 先生に褒められました。 | The teacher praised me. | 90–100 | 100, 100 | Meaning is correct; the active phrasing conveys the same event as the Japanese passive. |
| xingchen-agi/xing4.0-29b-a4b:free | 先生に褒められました。 | The teacher praised me. | 90–100 | ERR, 80 | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 先生に褒められました。 | I praised the teacher. | 0–49 | 45, 50 | You reversed who praised whom; the Japanese is passive (“I was praised”), not active (“I praised”). |
| xingchen-agi/xing4.0-29b-a4b:free | 先生に褒められました。 | I praised the teacher. | 0–49 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 日本に行ったことがあります。 | I have gone to Japan before | 90–100 | 85, 95 | Core meaning is correct, but “have gone to” can imply you are still in Japan; “have been to” better matches the past-experience meaning. |
| xingchen-agi/xing4.0-29b-a4b:free | 日本に行ったことがあります。 | I have gone to Japan before | 90–100 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 日本に行ったことがあります。 | I went to Japan. | 60–89 | 78, ERR | The overall meaning is correct, but the simple past "went" loses the experiential nuance of 〜たことがある ("have been to"). |
| xingchen-agi/xing4.0-29b-a4b:free | 日本に行ったことがあります。 | I went to Japan. | 60–89 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 日本に行ったことがあります。 | I want to go to Japan. | 0–49 | 10, ERR | The meaning is mostly wrong: “I want to go” expresses future desire, not past experience. The target grammar 〜たことある (“have been before”) was not conveyed. |
| xingchen-agi/xing4.0-29b-a4b:free | 日本に行ったことがあります。 | I want to go to Japan. | 0–49 | 0, 8 | Key element wrong: the grammar '〜たことがある' (have been to) was changed to 'want to go', which does not match the original meaning. Also missing a key word: the particle 'ことが' and the auxiliary 'ある' are absent. |
| nvidia/nemotron-3.5-super-vl:free | 寝る前に歯を磨いてください。 | Brush your teeth before you sleep, please. | 90–100 | 100, 95 | The meaning is fully equivalent; only phrasing and word order differ. |
| xingchen-agi/xing4.0-29b-a4b:free | 寝る前に歯を磨いてください。 | Brush your teeth before you sleep, please. | 90–100 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 寝る前に歯を磨いてください。 | Please brush your teeth after going to bed. | 40–69 | 50, 45 | The key error is “after” instead of “before”; 〜まえに means before doing something. |
| xingchen-agi/xing4.0-29b-a4b:free | 寝る前に歯を磨いてください。 | Please brush your teeth after going to bed. | 40–69 | 0, 40 | The meaning is completely reversed: the learner says 'after going to bed' instead of 'before going to bed.' This is a key error with the target grammar — まえに must mean 'before,' but the learner used 後で (after) or equivalent, changing the entire meaning of the sentence. |
| nvidia/nemotron-3.5-super-vl:free | 寝る前に歯を磨いてください。 | (empty) | 0–10 | 0, 0 | No answer was provided, so there is no meaning to evaluate. The response is empty. |
| xingchen-agi/xing4.0-29b-a4b:free | 寝る前に歯を磨いてください。 | (empty) | 0–10 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Phala] xingchen-agi/xing4.0-29b-a4b:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| nvidia/nemotron-3.5-super-vl:free | 薬を飲まなければなりません。 | I must take my medicine. | 90–100 | 95, 100 | The meaning is fully correct; adding "my" before "medicine" is only a phrasing difference and does not change the required meaning. |
| xingchen-agi/xing4.0-29b-a4b:free | 薬を飲まなければなりません。 | I must take my medicine. | 90–100 | 95, ERR | The meaning is identical. The learner's phrasing is perfectly natural English. No corrections needed. |
| nvidia/nemotron-3.5-super-vl:free | 薬を飲まなければなりません。 | I have to drink medicine | 85–100 | 100, 100 | The meaning is correct; “drink” and “take” convey the same idea here. |
| xingchen-agi/xing4.0-29b-a4b:free | 薬を飲まなければなりません。 | I have to drink medicine | 85–100 | 90, 90 | Same meaning; 'take' and 'drink' are both valid for お薬 in this context. |
| nvidia/nemotron-3.5-super-vl:free | 薬を飲まなければなりません。 | I don't have to take medicine. | 0–49 | 40, 40 | The negative “don’t” reverses the meaning; it says there is no obligation instead of stating that taking medicine is required. |
| xingchen-agi/xing4.0-29b-a4b:free | 薬を飲まなければなりません。 | I don't have to take medicine. | 0–49 | 40, 10 | The key meaning is reversed: the learner used negative form (don't have to) when the original says must (must take). The grammar of 〜なければならない is core and wrong here. |

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