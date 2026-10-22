# Exercise prompt eval

Known: 2370 words, 684 kanji. Generation runs per model: 20. Grading reps per answer: 2.

## Generation summary

| Model | Errors | Kanji-clean | Median ms | Avg in tok | Avg out tok | Avg cost $ | Providers |
|---|---|---|---|---|---|---|---|
| openai/gpt-6-luna | 0 | 19/20 | 2790 | 2105 | 3498 | 0.002012 | OpenAI |
| anthropic/claude-haiku-5.5 | 0 | 8/20 | 3113 | 3410 | 422 | 0.000552 | Google |
| deepseek/deepseek-v4-flash | 0 | 11/20 | 8178 | 1926 | 323 | 0.000187 | StreamLake, Venice |
| mistralai/mistral-small-2603 | 15 | 1/5 | 7486 | 2094 | 326 | 0.000501 | Mistral |
| google/gemini-3.1-flash-lite | 0 | 7/20 | 2300 | 1855 | 454 | 0.001145 | Google AI Studio |
| google/gemini-3.5-flash-lite | 0 | 16/20 | 1973 | 1855 | 347 | 0.001425 | Google AI Studio |

## Generated sentences (judge naturalness and grammar use)

### 1. n5-desu

- **openai/gpt-6-luna**: あの家は古い家ではありません。 (あのいえはふるいいえではありません。)
  - EN: That house is not an old house.
  - Grammar: ではありません is the polite negative form of the copula です, meaning “is not.” Use it after a noun or a な-adjective; for an い-adjective, use its negative conjugation instead. Here, it follows 家 to say that the house is not an old house.
  - Example: あの町は大きい町ではありません。 (That town is not a big town.)
  - kanji violations: none; 4398 ms
- **anthropic/claude-haiku-5.5**: 私は学生です。 (わたしはがくせいです。)
  - EN: I am a student.
  - Grammar: 〜です is the polite copula meaning 'is' or 'am/are', attached after a noun to state what something is. For the negative, 〜ではありません means 'is not' (casual: 〜じゃない). Here 学生です simply states that the speaker is a student.
  - Example: 先生ではありません。 (I am not a teacher.)
  - kanji violations: none; 6018 ms
- **deepseek/deepseek-v4-flash**: この町は新しい町ではありません。 (このまちはあたらしいまちではありません。)
  - EN: This town is not a new town.
  - Grammar: 〜です is the polite present affirmative copula meaning 'is.' 〜ではありません is the polite present negative copula meaning 'is not.' It is formed by adding では (or じゃ in casual speech) before ありません, the polite negative form of ある. In this sentence, ではありません negates that the town is new.
  - Example: これは私の本ではありません。 / これはわたしのほんではありません。 (This is not my book.)
  - kanji violations: none; 8851 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 彼は私の知り合いではありません。 (かれはわたしのしりあいではありません。)
  - EN: He is not an acquaintance of mine.
  - Grammar: The copula 'desu' is used at the end of a sentence to define a noun. To make it negative, replace 'desu' with 'dewa arimasen' or the more casual 'ja arimasen'. It acts as 'is not' in this sentence, negating the subject's identity as an acquaintance.
  - Example: この家は私の物です。 (This house is my property.)
  - kanji violations: none; 2892 ms
- **google/gemini-3.5-flash-lite**: 私家は古い家ではありません。 (わたしのかたはふるいいえではありません。)
  - EN: My house is not an old house.
  - Grammar: The target grammar uses です for 'is' in polite statements and ではありません for 'is not'. It attaches directly to nouns or adjectives to state what something is or is not. In this sentence, it denies that the house is old.
  - Example: あの町は古い町ではありません。 (That town is not an old town.)
  - kanji violations: none; 2693 ms

### 2. n5-masu-past

- **openai/gpt-6-luna**: 会議で方法を三つ習いました。 (かいぎでほうほうをみっつならいました。)
  - EN: I learned three methods at the meeting.
  - Grammar: 〜ました is the polite past form of a verb and means that an action happened. Form it by changing the verb’s ます form to ました. Here, 習いました means “learned.”
  - Example: 書類を見付けました。 (I found the document.)
  - kanji violations: none; 2783 ms
- **anthropic/claude-haiku-5.5**: 昨日、大阪で友達と食べました。 (きのう、おおさかでともだちとたべました。)
  - EN: Yesterday I ate with a friend in Osaka.
  - Grammar: The polite past 〜ました is formed by taking the masu-stem of a verb and adding ました, so 食べる becomes 食べました. It states that an action happened and was completed in the past, in polite speech. The negative form 〜ませんでした (masu-stem + ませんでした) means 'did not.'
  - Example: 昨日、映画を見ました。 (Yesterday I watched a movie.)
  - kanji violations: 昨映; 5067 ms
- **deepseek/deepseek-v4-flash**: 昨日会議をしましたか。 (きのうかいぎをしましたか。)
  - EN: Did you have a meeting yesterday?
  - Grammar: This sentence uses 〜ました, the polite past form of a verb. It is made by changing the verb's ます form ending to ました. Here, する (to do) becomes しました. The question particle か turns it into a polite yes/no question.
  - Example: 昨日スペイン語を勉強しませんでした。 (I did not study Spanish yesterday.)
  - kanji violations: 昨; 7444 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 昨日、会議で新しい方法を調べました。 (きのう、かいぎであたらしいほうほうをしらべました。)
  - EN: I investigated a new method at the meeting yesterday.
  - Grammar: The ending ～ました is the polite past tense form for verbs. You create it by taking the masu-stem of a verb and adding ～ました. It indicates that an action was completed in the past.
  - Example: 昨日、新しい本を読みませんでした。 (I did not read the new book yesterday.)
  - kanji violations: 昨; 2359 ms
- **google/gemini-3.5-flash-lite**: 会議の後で書類を調べました。 (かいぎのあとでしょるいをしらべました。)
  - EN: I checked the documents after the meeting.
  - Grammar: The ending ました is the polite past tense form for verbs. It is attached to the stem of a verb to indicate that an action was completed in the past. To form the negative past, you use ませんでした instead.
  - Example: 木曜日に車を直しました。 (I fixed the car on Thursday.)
  - kanji violations: none; 2009 ms

### 3. n5-tai

- **openai/gpt-6-luna**: 来週、駅前に行きたいです。 (らいしゅう、えきまえにいきたいです。)
  - EN: I want to go to the station next week.
  - Grammar: Attach たい to the verb stem to express wanting to do something. For 行く, the stem is 行き, so 行きたい means “want to go.” Here, です makes the sentence polite.
  - Example: 来週、手紙を出したいです。 (I want to send a letter next week.)
  - kanji violations: none; 2563 ms
- **anthropic/claude-haiku-5.5**: 水をのみたいです。 (みずをのみたいです。)
  - EN: I want to drink water.
  - Grammar: 〜たい is attached to the masu-stem of a verb (drop ます and add たい) to express the speaker's desire to do that action. It works like an i-adjective, so it can be made past (〜たかった) or negative (〜たくない). The object is usually marked with が or を, and です makes the sentence polite.
  - Example: 日本へ行きたいです。 (I want to go to Japan.)
  - kanji violations: none; 2908 ms
- **deepseek/deepseek-v4-flash**: 私映画を見たい、でもあの新しい映画です。 (わたしえいがをみたい、でもあのあたらしいえいがです。)
  - EN: I want to see a movie, but that new movie is it.
  - Grammar: The target grammar is '〜たい', which attaches to the stem of a verb (remove 'ます') to express desire to do that action. In this sentence, '見たい' comes from '見ます' (to see). The structure is 'verb stem + たい', and the object is often marked with を.
  - Example: 寿司を食べたい。 (I want to eat sushi.)
  - kanji violations: 映寿; 8178 ms
- **mistralai/mistral-small-2603**: 私たちは来週海外に行きたいです。 (わたしたちはらいしゅうかいがいにいきたいです。)
  - EN: We want to go abroad next week.
  - Grammar: 〜たい expresses the speaker's desire to do something. It is formed by attaching たい to the stem form of a verb. In this sentence, 行き (stem of 行く 'to go') + たい means 'want to go'. The particle に indicates the direction or goal of the action.
  - Example: 彼らは新しいレストランで洋食を食べたいです。 (They want to eat Western-style food at the new restaurant.)
  - kanji violations: none; 6275 ms
- **google/gemini-3.1-flash-lite**: 来週、私は新しい手紙を書きたい。 (らいしゅう、わたしはあたらしいてがみをかきたい。)
  - EN: I want to write a new letter next week.
  - Grammar: The grammar ～たい is used to express a desire. You attach it to the masu-stem of a verb, which is the form used before 'masu'. For example, from 'kaku' (to write), you get 'kaki' and add 'tai' to make 'kakitai'.
  - Example: 美味しい洋食を食べたい。 (I want to eat delicious Western-style food.)
  - kanji violations: 味; 2306 ms
- **google/gemini-3.5-flash-lite**: 私会行たい (わたし かい いきたい)
  - EN: I want to go to the gathering.
  - Grammar: The target grammar 〜たい expresses the speaker's desire to do something. It attaches directly to the stem of a verb, changing it into an adjective that means 'want to [verb]'. In this sentence, 行く (to go) becomes 行きたい (want to go).
  - Example: 私手紙書たい (I want to write a letter.)
  - kanji violations: none; 1761 ms

### 4. n5-te-kudasai

- **openai/gpt-6-luna**: すみません、ここで待ってください。 (すみません、ここでまってください。)
  - EN: Excuse me, please wait here.
  - Grammar: 〜てください means “please do.” Form it by putting ください after a verb’s て-form. Here, 待つ becomes 待って, followed by ください to make a polite request. The kanji 待 is not in the allowed list, so this sentence cannot use 待って; it should be written in hiragana as まって.
  - Example: ここでまってください。 (Please wait here.)
  - kanji violations: none; 2653 ms
- **anthropic/claude-haiku-5.5**: ちょっとまってください。 (ちょっとまってください。)
  - EN: Please wait a moment.
  - Grammar: 〜てください is used to politely ask someone to do something. It is formed by attaching ください to the te-form of a verb. In this sentence, 待つ (to wait) becomes まって, and adding ください makes a polite request for the listener to wait.
  - Example: ここにすわってください。 (Please sit here.)
  - kanji violations: none; 2311 ms
- **deepseek/deepseek-v4-flash**: ここに名前を書いてください。 (ここになまえをかいてください。)
  - EN: Please write your name here.
  - Grammar: This sentence uses 〜てください, which is a polite request form. It is made by taking the て-form of a verb (here 書く → 書いて) and adding ください. It means 'please do (verb)'. It is commonly used in daily situations like asking someone to do something.
  - Example: 水を飲んでください。 (Please drink water.)
  - kanji violations: none; 18488 ms
- **mistralai/mistral-small-2603**: 火を消してください (ひをけしてください)
  - EN: Please put out the fire.
  - Grammar: 〜てください is a polite way to ask someone to do something. It is formed by taking the te-form of a verb and adding ください. In this sentence, 消す (to put out) is in the te-form (消して) and ください is added to make it a polite request.
  - Example: 窓を開けてください (Please open the window.)
  - kanji violations: 窓; 2239 ms
- **google/gemini-3.1-flash-lite**: すみません、その本を五冊取ってください。 (すみません、そのほんをごさつとってください。)
  - EN: Excuse me, please take those five books.
  - Grammar: The grammar 〜てください is used to make a polite request. It is formed by taking the te-form of a verb and adding ください. In this sentence, it turns the verb 取る (to take) into a request.
  - Example: すみません、水を飲んでください。 (Excuse me, please drink the water.)
  - kanji violations: none; 2238 ms
- **google/gemini-3.5-flash-lite**: 水を飲む下さい。 (みずをのむください。)
  - EN: Please drink water.
  - Grammar: The grammar point 〜てください is used to politely ask someone to do an action. It is formed by taking the te-form of a verb and attaching ください. In this sentence, it turns 'to drink' into 'please drink'.
  - Example: 外に行く下さい。 (Please go outside.)
  - kanji violations: none; 1688 ms

### 5. n5-te-iru

- **openai/gpt-6-luna**: 朝、お茶を飲んでいる。 (あさ、おちゃをのんでいる。)
  - EN: I’m drinking tea this morning.
  - Grammar: 〜ている is formed by adding いる to a verb’s て-form. It describes an action that is happening now. Here, 飲んでいる means “is drinking.”
  - Example: 今、お茶を飲んでいる。 (I’m drinking tea now.)
  - kanji violations: none; 2790 ms
- **anthropic/claude-haiku-5.5**: 雨が降っている。 (あめがふっている。)
  - EN: It is raining.
  - Grammar: The 〜ている form attaches to the te-form of a verb to show an action in progress, such as 降っている (is falling). It can also describe a continuing state, like knowing or living somewhere. Here 降って + いる shows that rain is falling right now.
  - Example: 母が台所で料理を作っている。 (My mother is cooking in the kitchen.)
  - kanji violations: 降; 4500 ms
- **deepseek/deepseek-v4-flash**: 私は今お茶を飲んでいます。 (わたしはいまおちゃをのんでいます。)
  - EN: I am drinking tea now.
  - Grammar: The 〜て form of a verb combined with います expresses an ongoing action or current state. In this sentence, 飲んで (from 飲む, 'to drink') + います means 'is drinking' right now. It can also describe a habitual action or a resultant state (e.g., 結婚している 'is married'), but here it's an action in progress.
  - Example: 彼は本を読んでいます。 (He is reading a book.)
  - kanji violations: none; 10899 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 君は今、何をお茶で飲んでいるのですか。 (きみはいま、なにをおちゃでのんでいるのですか。)
  - EN: What are you drinking with your tea right now?
  - Grammar: The 〜ている form is used to describe an ongoing action that is happening right now. It is formed by attaching the te-form of a verb to いる. In this sentence, 飲んでいる expresses the action of drinking as it progresses in the present.
  - Example: 私達は今、新しい道を歩いている。 (We are walking on a new road now.)
  - kanji violations: none; 2491 ms
- **google/gemini-3.5-flash-lite**: 私見ている。 (わたしみている。)
  - EN: I am watching.
  - Grammar: The target grammar 〜ている expresses an ongoing action or state. It is formed by attaching ている to the te-form of a verb. Here, 見る becomes 見て and combines with いる to mean 'is watching' or 'am watching'.
  - Example: 私話している。 (I am speaking.)
  - kanji violations: none; 1632 ms

### 6. n5-te-mo-ii

- **openai/gpt-6-luna**: この車を外してもいいですか。 (このくるまをはずしてもいいですか。)
  - EN: May I move this car out of the way?
  - Grammar: The pattern 〜てもいい asks for or gives permission: “may” or “it is okay to.” Form it by attaching てもいい to the te-form of a verb. Here, 外す becomes 外して, so the sentence asks whether it is okay to move the car out of the way.
  - Example: お金を払ってもいいですか。 (May I pay?)
  - kanji violations: none; 2945 ms
- **anthropic/claude-haiku-5.5**: ここで写真を撮ってもいいですか。 (ここでしゃしんをとってもいいですか。)
  - EN: Is it okay to take a photo here?
  - Grammar: 〜てもいい is used to ask for or give permission, meaning 'it is okay to ...' or 'may I ...'. It is formed by attaching もいい to the te-form of a verb. In this sentence, 撮って (take) becomes 撮ってもいい, and adding ですか turns it into a polite question asking whether taking a photo is allowed.
  - Example: ここに座ってもいいですか。 (Is it okay to sit here?)
  - kanji violations: 撮; 3113 ms
- **deepseek/deepseek-v4-flash**: 今朝ここに座ってもいい？ (けさここにすわってもいい？)
  - EN: May I sit here this morning?
  - Grammar: : The grammar '〜てもいい' expresses permission, meaning 'may I?' or 'it is okay to'. It is formed by adding 'てもいい' to the te-form of a verb. In this sentence, '座る' becomes '座ってもいい？' to ask for permission.
  - Example: このりんごを食べてもいいですか？ (May I eat this apple?)
  - kanji violations: none; 5559 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: この車をここに止めてもいいですか。 (このくるまをここにとめてもいいですか。)
  - EN: Is it okay to park this car here?
  - Grammar: The grammar 〜てもいい is used to ask for or grant permission. It is formed by taking the te-form of a verb and adding もいい. In this question, it is used to politely ask if an action is acceptable.
  - Example: ここで写真を撮ってもいいですか。 (Is it okay to take a photo here?)
  - kanji violations: 撮; 2300 ms
- **google/gemini-3.5-flash-lite**: 車を買ってもいい。 (くるまをかってもしずか)
  - EN: You may buy a car.
  - Grammar: The grammar 〜てもいい means 'may' or 'it is okay to do something'. It is formed by changing a verb into the te-form (such as 買って) and adding もいい. In this sentence, it grants permission to buy a car.
  - Example: お金を払ってもいい。 (You may pay the money.)
  - kanji violations: none; 1712 ms

### 7. n5-te-wa-ikenai

- **openai/gpt-6-luna**: ここで花を取ってはいけない。 (ここではなをとってはいけない。)
  - EN: You must not pick flowers here.
  - Grammar: 〜てはいけない means that an action is prohibited or not allowed. Form it by adding はいけない to a verb's te-form. Here, 取る becomes 取って, so 取ってはいけない means you must not pick the flowers.
  - Example: ここで犬を打ってはいけない。 (You must not hit the dog here.)
  - kanji violations: none; 2834 ms
- **anthropic/claude-haiku-5.5**: ここでたばこを吸ってはいけない。 (ここでたばこをすってはいけない。)
  - EN: You must not smoke here.
  - Grammar: 〜てはいけない is used to forbid an action, meaning 'must not do ~'. It is formed by attaching はいけない to the te-form of a verb. In this sentence, 吸って (te-form of 吸う, to smoke) + はいけない expresses a prohibition against smoking here.
  - Example: ここで写真を撮ってはいけない。 (You must not take photos here.)
  - kanji violations: 吸撮; 2629 ms
- **deepseek/deepseek-v4-flash**: 寝てはいけない (ねてはいけない)
  - EN: You must not try sleeping on the road.
  - Grammar: The target grammar 〜てはいけない expresses prohibition, meaning 'must not' or 'cannot do'. It is formed by adding てはいけない to the te-form of a verb. In this sentence, the verbs 寝る (to sleep) becomes 寝てはいけない (must not sleep).
  - Example: この花を食べてはいけない。 (You must not eat this flower.)
  - kanji violations: 寝; 6918 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: この道路で金魚を放してはいけない。 (このどうろできんぎょをはなしてはいけない。)
  - EN: You must not release goldfish on this road.
  - Grammar: The grammar 〜てはいけない is used to express a prohibition. To form it, attach 〜てはいけない to the te-form of a verb. It means that you are not allowed to do the action described by the verb.
  - Example: ここにゴミを出してはいけない。 (You must not put trash out here.)
  - kanji violations: 放; 2089 ms
- **google/gemini-3.5-flash-lite**: ここで花を取ってははいけない。 (ここで はな を とっ て は いけ ない 。)
  - EN: You must not pick flowers here.
  - Grammar: The grammar pattern 〜てはいけない (te wa ikenai) is used to express prohibitions or rules, meaning 'must not' or 'should not do'. It is formed by changing a verb into its te-form, adding は (wa), and following it with いけない (ikenai). In this sentence, it tells the listener that picking flowers in this specific place is strictly prohibited.
  - Example: ここで水を飲んではいけない。 (You must not drink water here.)
  - kanji violations: none; 2236 ms

### 8. n5-mashou

- **openai/gpt-6-luna**: 月光を見ましょう。 (げっこうをみましょう。)
  - EN: Let’s look at the moonlight.
  - Grammar: 〜ましょう attaches to the verb stem and means “let’s do” or “shall we do.” For 見る, remove る to get 見, then add ましょう. Here, 見ましょう suggests looking at the moonlight together.
  - Example: 日記を読みましょう。 (Let’s read the diary.)
  - kanji violations: none; 2426 ms
- **anthropic/claude-haiku-5.5**: 一緒に歩きましょう。 (いっしょにあるきましょう。)
  - EN: Let's walk together.
  - Grammar: 〜ましょう is the polite volitional form, meaning "let's do ~" or "shall we ~?" It is formed by taking the masu-stem of a verb and adding ましょう (ex: 歩く → 歩き → 歩きましょう). It is used to suggest an action that the speaker and listener will do together. In this sentence, 歩きましょう suggests walking together, with 一緒に adding the meaning of "together."
  - Example: もう帰りましょう。 (Let's go home now.)
  - kanji violations: 緒; 3073 ms
- **deepseek/deepseek-v4-flash**: 公園で一緒に写真を撮りましょう。 (こうえんでいっしょにしゃしんをとりましょう。)
  - EN: Let's take a photo together at the park.
  - Grammar: The pattern 〜ましょう is the polite volitional form, meaning 'let's do [verb]'. It is formed by taking the verb stem (the ます-form without ます) and adding ましょう. For example, 撮ります (torimasu) becomes 撮りましょう (torimashou). This sentence invites someone to do an action together in a friendly, polite way.
  - Example: 駅で待ちましょう。 (Let's wait at the station.)
  - kanji violations: 緒撮; 18033 ms
- **mistralai/mistral-small-2603**: 月光を浴びながら日記を書きましょう (げっこうをあびながらにっきをかきましょう)
  - EN: Let's write in our diary while enjoying the moonlight.
  - Grammar: 〜ましょう is used to suggest doing something together or to express a polite invitation. It is formed by adding ましょう to the verb stem. In this sentence, 書きましょう (let's write) is the main verb, and 浴びながら (while bathing) describes how the action is done.
  - Example: この本を一緒に読みましょう (Let's read this book together.)
  - kanji violations: 緒; 11212 ms
- **google/gemini-3.1-flash-lite**: 今晩は、この作品を二人で一緒に読みましょう。 (こんばんわ、このさくひんをふたりでいっしょによみましょう。)
  - EN: Good evening, let's read this work together, the two of us.
  - Grammar: The 〜ましょう ending is used to express a suggestion or an invitation to do something together. It is formed by taking the stem of a verb (the masu-stem) and adding 〜ましょう. It translates to 'let's do [verb]' in English.
  - Example: 来週、映画を見に行きましょう。 (Let's go see a movie next week.)
  - kanji violations: 緒映; 2334 ms
- **google/gemini-3.5-flash-lite**: 次々に出会う。 (つぎつぎに出会う。)
  - EN: Meet one after another.
  - Grammar: Since the target grammar is 〜ましょう (let's do), you attach 〜ましょう to the stem of a verb to suggest doing something together. For example, 会う becomes 会いましょう (let's meet).
  - Example: 次々に出会いましょう。 (Let's meet one after another.)
  - kanji violations: none; 1653 ms

### 9. n5-masenka

- **openai/gpt-6-luna**: 妹といっしょに泳ぎませんか。 (いもうとといっしょにおよぎませんか。)
  - EN: Won't you swim with me?
  - Grammar: 〜ませんか is a polite way to invite someone to do something, like “Won’t you…?” or “Would you like to…?” Form it by attaching ませんか to the verb stem. Here, 泳ぐ becomes 泳ぎませんか, inviting the listener to swim together.
  - Example: いっしょに洋食を食べませんか。 (Won't you have Western-style food with me?)
  - kanji violations: none; 2618 ms
- **anthropic/claude-haiku-5.5**: 一緒に昼ご飯を食べませんか。 (いっしょにひるごはんをたべませんか。)
  - EN: Won't you have lunch together?
  - Grammar: 〜ませんか is the polite negative question form used to invite someone to do something, meaning roughly 'won't you ...?' or 'shall we ...?'. It is formed by taking the masu-stem of a verb and adding ませんか. In this sentence, 食べ (tabe, from 食べる) plus ませんか turns the verb into a friendly invitation to have lunch together.
  - Example: 一緒に水を飲みませんか。 (Won't you drink some water together?)
  - kanji violations: 緒; 3337 ms
- **deepseek/deepseek-v4-flash**: もう一緒に、コーヒーを飲みませんか？ (もういっしょに、コーヒーをのみませんか？)
  - EN: Won't you join me for a coffee? (Won't you have a coffee with me?)
  - Grammar: The pattern 〜ませんか is the negative polite form of a verb followed by か, used to make a polite invitation or suggestion. It literally means 'won't you do ~?' and implies the speaker wants to do the action together with the listener. In this sentence, 飲みませんか (from 飲む) invites someone to drink coffee together.
  - Example: 今週末、一緒に映画を見ませんか？ (Won't you go to the movies this weekend?)
  - kanji violations: 緒映; 9584 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 今晩は、一緒に洋食を食べませんか。 (こんばんわ、いっしょにようしょくをたべませんか。)
  - EN: Good evening, would you like to eat Western-style food together?
  - Grammar: The 〜ませんか form is used to make polite invitations. You attach ませんか to the masu-stem of a verb. It literally asks 'won't you do...?', functioning as 'would you like to...?'.
  - Example: 明日、地下鉄で会社に行きませんか。 (Won't you go to the company by subway tomorrow?)
  - kanji violations: 緒; 2230 ms
- **google/gemini-3.5-flash-lite**: 会社員と一緒に洋食を食べませんか。 (かいしゃいんといっしょにようしょくてたべませんか。)
  - EN: Won't you eat Western-style food together with the company employee?
  - Grammar: The grammar pattern 〜ませんか is used to make an invitation, politely asking someone to do something together. It is formed by attaching ませんか to the stem of a verb (such as 食べます changing to 食べませんか). In this sentence, it invites someone to eat Western-style food.
  - Example: 明日洋食を食べませんか。 (Won't you eat Western-style food tomorrow?)
  - kanji violations: 緒; 1978 ms

### 10. n5-kara-reason

- **openai/gpt-6-luna**: 今日は雨だから、家で休む。 (きょうはあめだから、いえでやすむ。)
  - EN: Because it’s raining today, I’ll rest at home.
  - Grammar: 〜から means “because” and introduces a reason. Attach it to the plain form of a verb or adjective, or use a noun or な-adjective with だから. Here, 雨だから gives the reason for resting at home.
  - Example: 今日は日曜日だから、家にいる。 (Because it’s Sunday today, I’ll stay home.)
  - kanji violations: none; 2951 ms
- **anthropic/claude-haiku-5.5**: 雨が降るから、傘を持って行きます。 (あめがふるから、かさをもっていきます。)
  - EN: Because it's raining, I'll take an umbrella with me.
  - Grammar: から expresses a reason or cause, meaning 'because' or 'since'. It attaches to the end of a plain or polite clause, such as 雨が降る (plain form) or 雨が降ります (polite form). The clause before から gives the reason, and the main clause after it states the result or action.
  - Example: 疲れたから、少し休みます。 (Because I'm tired, I'll rest a little.)
  - kanji violations: 降傘疲; 2952 ms
- **deepseek/deepseek-v4-flash**: きれいから、難しいです。 (きれいから、むずかしいです。)
  - EN: It’s clean, so it’s difficult.
  - Grammar: 〜から means 'because' and attaches to plain forms (な-adjectives drop な before から). In this sentence, きれいから (because it's clean) shows the reason, and 難しいです (is difficult) shows the result. から always comes after the reason clause, and the main clause follows.
  - Example: 病気だから、休みました。 (Because I was sick, I was absent.)
  - kanji violations: none; 9961 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 今日はお金がないから、家で休む。 (きょうはおかねがないから、うちでやすむ。)
  - EN: Because I don't have money today, I will rest at home.
  - Grammar: The particle から is used to indicate a reason or cause, effectively translating to 'because' or 'since'. You attach it to the end of a clause to explain why the subsequent action or state is occurring. It is common to place the reason clause before the main clause.
  - Example: 明日は月曜日だから、早く寝る。 (Because tomorrow is Monday, I will go to sleep early.)
  - kanji violations: 寝; 2470 ms
- **google/gemini-3.5-flash-lite**: 今日、米が無いから、出かける。 (きょう、こめがないから、でかける。)
  - EN: Today, because there is no rice, I am going out.
  - Grammar: The particle から means 'because' or 'since'. It attaches to the end of a clause to give a reason for the following action or state. Here, '米が無いから' provides the reason for '出かける'.
  - Example: 新しいから、良い。 (Because it is new, it is good.)
  - kanji violations: none; 2042 ms

### 11. n5-ga-but

- **openai/gpt-6-luna**: 兄は古いが、まだ使える。 (あにはふるいが、まだつかえる。)
  - EN: My older brother is old-fashioned, but he can still be useful.
  - Grammar: The conjunction が means “but” and connects two contrasting ideas. It follows a plain form, such as an adjective or verb. Here, 古い describes the older brother, while まだ使える contrasts that description with the fact that he is still useful.
  - Example: 冬は寒いが、星がきれいだ。 (Winter is cold, but the stars are beautiful.)
  - kanji violations: none; 2690 ms
- **anthropic/claude-haiku-5.5**: 約束の時間に行きましたが、先生はまだ来ていませんでした。 (やくそくのじかんにいきましたが、せんせいはまだきていませんでした。)
  - EN: I went at the appointed time, but the teacher had not arrived yet.
  - Grammar: が is a conjunction meaning 'but' that joins two clauses, showing contrast between them. It is placed after the first clause, which ends in a plain or polite form, and the second clause follows. In this sentence, the speaker went at the agreed time, but the teacher had not yet arrived, so the contrast is between the speaker's action and the unexpected result.
  - Example: 日本語を勉強していますが、まだ難しいです。 (I am studying Japanese, but it is still difficult.)
  - kanji violations: none; 3954 ms
- **deepseek/deepseek-v4-flash**: あの記事は面白いが、ちょっと長い。 (あのきじはおもしろいが、ちょっとながい。)
  - EN: That article is interesting, but a little long.
  - Grammar: The particle が (ga) can be used as a conjunction meaning 'but' to contrast two clauses. It is placed after the first clause (in plain or polite form) and before the second clause. This sentence shows that contrast—the article is interesting, but it has the negative point of being long.
  - Example: ケーキを試したが、美味しくなかった。 (I tried the cake, but it was not tasty.)
  - kanji violations: 試味; 6669 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: この中古の自動車は安いですが、とても古いです。 (このちゅうこのじどうしゃはやすいですが、とてもふるいです。)
  - EN: This secondhand car is cheap, but it is very old.
  - Grammar: The particle が is used at the end of a clause to connect it to the following clause with the meaning of 'but' or 'although'. When following an i-adjective (like 安い), you can simply attach が directly to it. It makes your speech sound more natural by softening the tone compared to saying two separate sentences.
  - Example: 日本語は難しいですが、とても面白いです。 (Japanese is difficult, but it is very interesting.)
  - kanji violations: none; 2554 ms
- **google/gemini-3.5-flash-lite**: 車は古いですが、走ります。 (くるまはふるいですが、はしります。)
  - EN: The car is old, but it runs.
  - Grammar: The particle が is used as a conjunction meaning 'but' or 'however' to connect two opposing clauses. It is attached to the end of the first clause, which can end with an adjective or verb in its polite or plain form. In this sentence, it connects 'is old' with 'runs'.
  - Example: 冬は寒いですが、天気がいいです。 (Winter is cold, but the weather is nice.)
  - kanji violations: none; 1955 ms

### 12. n5-mae-ni

- **openai/gpt-6-luna**: 勉強するまえに、文字を覚える。 (べんきょうするまえに、もじをおぼえる。)
  - EN: I memorize the characters before studying.
  - Grammar: To say “before doing something,” attach まえに to the dictionary form of a verb. Here, まえに follows 勉強する, meaning the character memorization happens before studying.
  - Example: 出るまえに、母に電話する。 (I call my mother before leaving.)
  - kanji violations: none; 2864 ms
- **anthropic/claude-haiku-5.5**: 寝るまえに歯を磨きます。 (ねるまえにはをみがきます。)
  - EN: I brush my teeth before going to bed.
  - Grammar: 〜まえに is attached to the dictionary form of a verb to mean 'before doing ___'. It describes an action that happens earlier than the main action in the sentence. Here, 寝る (to sleep) + まえに gives 'before sleeping', and the main clause says the speaker brushes their teeth.
  - Example: 食べるまえに手を洗います。 (I wash my hands before eating.)
  - kanji violations: 寝磨; 2559 ms
- **deepseek/deepseek-v4-flash**: 食事の前に手を洗うよ。 (しょくじのまえにてをあらうよ。)
  - EN: Wash your hands before eating.
  - Grammar: The pattern 〜まえに means 'before doing ~'. It is formed by attaching まえに to the dictionary form of a verb (e.g., たべるまえに = before eating), or after a noun + の (e.g., しょくじのまえに = before the meal). In this sentence, しょくじのまえに sets the time frame, and the main action (wash hands) happens before that.
  - Example: ねる前に勉強します。 (I will study before going to bed.)
  - kanji violations: none; 7787 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 温泉に入るまえに、体を洗います。 (おんせんに はいる まえに、からだを あらいます。)
  - EN: Before getting into the hot spring, I wash my body.
  - Grammar: The grammar 〜まえに is used to express that one action happens before another. It is formed by attaching 〜まえに to the dictionary form of a verb. It translates to 'before [doing]'.
  - Example: 寝るまえに、本を読みます。 (I read a book before going to sleep.)
  - kanji violations: 寝; 2162 ms
- **google/gemini-3.5-flash-lite**: 温泉に行く前に、お金を払う。 (おんせんに行くまえに、お金をはらう。)
  - EN: Before going to the hot springs, I pay money.
  - Grammar: The grammar 〜まえに means 'before doing [action]'. It is formed by attaching 〜まえに to the dictionary form of a verb. In this sentence, it connects 'going to the hot springs' with the action of paying.
  - Example: 外に行く前に、お金を取る。 (Before going outside, I take money.)
  - kanji violations: none; 2062 ms

### 13. n5-te-kara

- **openai/gpt-6-luna**: 登山してから、茶屋で茶を飲む。 (とざんしてから、ちゃやでちゃをのむ。)
  - EN: After mountain climbing, I drink tea at a tea shop.
  - Grammar: 〜てから means “after doing something.” Attach から to a verb in the て-form. Here, 登山してから means “after mountain climbing,” and it comes before the action of drinking tea.
  - Example: 茶を買ってから、茶屋へ行く。 (After buying tea, I go to the tea shop.)
  - kanji violations: none; 368507 ms
- **anthropic/claude-haiku-5.5**: ごはんを食べてから、散歩に行きます。 (ごはんをたべてから、さんぽにいきます。)
  - EN: I'll go for a walk after eating.
  - Grammar: The pattern 〜てから means 'after doing ~'. It attaches to the te-form of a verb and marks the action that comes first. In this sentence, eating happens first, and then the walk follows.
  - Example: 手を洗ってから、ご飯を食べます。 (I wash my hands and then eat.)
  - kanji violations: 散; 2741 ms
- **deepseek/deepseek-v4-flash**: 手を洗ってから、ご飯を食べます。 (てをあらってから、ごはんをたべます。)
  - EN: After washing my hands, I eat a meal.
  - Grammar: The pattern 〜てから means 'after doing (verb)'. It connects two sequential actions by attaching てから to the te-form of the first verb. In this sentence, 洗って from 洗う (to wash) becomes 洗ってから, showing that washing hands happens before eating.
  - Example: 勉強してから、テレビを見ます。 (After studying, I watch TV.)
  - kanji violations: none; 6961 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 登山をしてから、茶屋で休みました。 (とざんをしてから、ちゃやでやすみました。)
  - EN: After mountain climbing, I rested at a tea shop.
  - Grammar: The grammar 〜てから is used to express that one action happens after another. It is formed by taking the te-form of a verb and adding から. It indicates a sequence of events where the first action is completed before the second begins.
  - Example: 作文を書いてから、家に帰ります。 (I will go home after writing the composition.)
  - kanji violations: none; 2085 ms
- **google/gemini-3.5-flash-lite**: 木を見てから、山に上る。 (きをみてから、やまにのぼる。)
  - EN: After looking at the tree, I will climb the mountain.
  - Grammar: The grammar pattern 〜てから means 'after doing [action]'. It is formed by attaching から to the te-form of a verb. In this sentence, it connects the action of looking at the tree with the subsequent action of climbing the mountain.
  - Example: 話をしてから、買う。 (After talking, I will buy it.)
  - kanji violations: none; 2027 ms

### 14. n5-tari-tari

- **openai/gpt-6-luna**: 喫茶店で勉強したり、話したりする。 (きっさてんでべんきょうしたり、はなしたりする。)
  - EN: I do things like study and chat at a cafe.
  - Grammar: 〜たり〜たりする lists examples of actions, rather than an exhaustive list. Attach たり to the past-form stem of each verb, then finish with する. Here, it gives studying and chatting as examples of things one does at a cafe.
  - Example: 昔話を聞いたり、楽しんだりする。 (I do things like listen to folk tales and enjoy myself.)
  - kanji violations: none; 2997 ms
- **anthropic/claude-haiku-5.5**: 休みの日は、本を読んだり、映画を見たりします。 (やすみのひは、ほんをよんだり、えいがをみたりします。)
  - EN: On days off, I read books, watch movies, and so on.
  - Grammar: The 〜たり〜たりする pattern lists two or more representative actions without stating them exhaustively, meaning 'do things like A and B.' To form it, take the past (た) form of each verb, change the final た to たり, and then add する in its appropriate form. In this sentence, 読んだり and 見たりします list reading and watching as examples of what the speaker does on days off.
  - Example: 週末は、買い物をしたり、料理をしたりします。 (On weekends, I go shopping, cook, and so on.)
  - kanji violations: 映; 7756 ms
- **deepseek/deepseek-v4-flash**: 昨日たり勉強したり掃除したりしましたが、どこへも行きませんでした。 (きのうたりべんきょうしたりそうじしたりしましたが、どこへもいきませんでした。)
  - EN: Yesterday I did things like studying and cleaning, but I didn't go anywhere.
  - Grammar: The pattern 〜たり〜たりする is used to list representative actions or states, implying that others are also included. It is formed by adding たり to the た-form (past tense stem) of verbs, then ending with する (or です in polite speech). In this sentence, 勉強したり掃除したりする shows that studying and cleaning were examples of what was done yesterday, leaving room for other activities. The negative form しませんでした is used in the second clause for 'didn't go'.
  - Example: 今日は買い物したり料理したりします。 (Today I will do things like shopping and cooking.)
  - kanji violations: 昨掃除; 11620 ms
- **mistralai/mistral-small-2603**: 休みの日は本を読んだり映画を見たりします。 (やすみのひはほんをよんだりえいがをみたりします。)
  - EN: On my days off, I do things like read books and watch movies.
  - Grammar: The 〜たり〜たりする pattern is used to list two or more representative actions or states. The verb before たり is in its casual past form (e.g., 読む → 読んだ). This pattern implies that these are examples, not an exhaustive list. In this sentence, it shows typical activities on days off.
  - Example: 週末は散歩したり買い物したりします。 (On weekends, I do things like take walks and go shopping.)
  - kanji violations: 映散; 7486 ms
- **google/gemini-3.1-flash-lite**: 昨日は喫茶店で勉強したり、空き缶を捨てたりした。 (きのうはきっさてんでべんきょうしたり、あきかんをすてたりした。)
  - EN: Yesterday, I did things like study at the cafe and throw away empty cans.
  - Grammar: The 〜たり〜たりする pattern is used to list representative actions. It implies that you did these things and potentially others as well. You form it by taking the past tense (ta-form) of verbs and adding り.
  - Example: 休みの日は本を読んだり、音楽を聴いたりする。 (On my days off, I do things like read books and listen to music.)
  - kanji violations: 昨捨聴; 3514 ms
- **google/gemini-3.5-flash-lite**: 昨日、本を読んだり、話したりした。 (きのう、ほんをよんだり、はなしたりした。)
  - EN: Yesterday, I did things like reading books and talking.
  - Grammar: The pattern 〜たり〜たりする is used to list multiple representative actions. You attach たり to the past-tense plain form of verbs and end the sentence with する. It implies there were also other unmentioned actions.
  - Example: お茶を飲んだり、話したりする。 (I do things like drink tea and talk.)
  - kanji violations: 昨; 3192 ms

### 15. n5-nai-de-kudasai

- **openai/gpt-6-luna**: 危ないから、走らないでください。 (あぶないから、はしらないでください。)
  - EN: It’s dangerous, so please don’t run.
  - Grammar: 〜ないでください means “please do not do something.” Form it by changing a verb to its negative ない form, then adding でください. Here, 走る becomes 走らない, followed by でください.
  - Example: ここで休まないでください。 (Please don’t rest here.)
  - kanji violations: none; 2670 ms
- **anthropic/claude-haiku-5.5**: ここでたばこをすわないでください。 (ここでたばこをすわないでください。)
  - EN: Please do not smoke here.
  - Grammar: 〜ないでください is formed by taking the nai-form stem of a verb (verb ない-form without the final い) and adding でください. It is a polite request asking someone not to do an action. In this sentence, the verb is attached to ないでください to politely ask the listener not to smoke here.
  - Example: ここで写真をとらないでください。 (Please do not take photos here.)
  - kanji violations: none; 2926 ms
- **deepseek/deepseek-v4-flash**: 部屋の中で吸わないでください。 (へやのなかですわないでください。)
  - EN: Please do not smoke inside the room.
  - Grammar: The pattern [negative form of verb without ない] + でください means "please do not [verb]." Form the ない stem of a verb (e.g., 吸う → 吸わない → 吸わ), then add ないでください. This is a polite request not to perform an action.
  - Example: 廊下で走らないでください。 ("Please do not run in the hallway.")
  - kanji violations: 吸廊; 7440 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: この部屋で走らないで下さい。 (このへやではしらないでください。)
  - EN: Please do not run in this room.
  - Grammar: The construction 〜ないでください is used to make a negative request. You form it by taking the nai-form of a verb and adding でください. It is a polite way to ask someone not to do something.
  - Example: ここで写真を撮らないで下さい。 (Please do not take photos here.)
  - kanji violations: 撮; 1943 ms
- **google/gemini-3.5-flash-lite**: ここで車を使うな。 (ここでくるまをつかうな。)
  - EN: Please do not use a car here.
  - Grammar: The ending 〜な attaches to the dictionary form of a verb to make a direct, casual negative command meaning 'do not do...'. While 〜ないでください is the polite way to ask someone not to do something, 〜な is often used by people in authority or in rough male speech. In this sentence, it tells someone not to use a car here.
  - Example: ここで休むな。 (Please do not rest here.)
  - kanji violations: none; 2070 ms

### 16. n5-yori

- **openai/gpt-6-luna**: 森は町より静かだ。 (もりはまちよりしずかだ。)
  - EN: The woods are quieter than the town.
  - Grammar: AはBより〜 compares A with B and says that A has the stated quality to a greater degree. Put より after the thing used as the comparison, B. Here, 森は町より静かだ means that the woods are quieter than the town.
  - Example: 特急は汽船より速い。 (The limited express train is faster than the steamship.)
  - kanji violations: none; 2600 ms
- **anthropic/claude-haiku-5.5**: この山は富士山より高いです。 (このやまはふじさんよりたかいです。)
  - EN: This mountain is higher than Mt. Fuji.
  - Grammar: The pattern AはBより〜 compares two things and means 'A is more ~ than B'. A is the subject marked with は, B is the thing being compared marked with より, and the adjective (here 高い) describes the quality being compared. In this sentence, the mountain is said to be higher than Mt. Fuji.
  - Example: 电車は車よりはやいです。 (The train is faster than the car.)
  - kanji violations: 富电; 2898 ms
- **deepseek/deepseek-v4-flash**: 夏より冬は暑い。 (なつよりふゆはあつい。)
  - EN: Summer is hotter than winter.
  - Grammar: This sentence uses the pattern 'AはBより〜' to compare two things. 'A' is followed by 'は', 'B' by 'より', and then an adjective (here '暑い') ends the sentence. It means 'A is more ~ than B'. The adjective remains in its dictionary form; no change is needed.
  - Example: 私の家はあなたの家より大きい。 (My house is bigger than your house.)
  - kanji violations: none; 6645 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 特急は普通より速いです。 (とっきゅうはふつうよりはやいです。)
  - EN: The limited express train is faster than the local train.
  - Grammar: The structure 'AはBより[adjective]です' is used to compare two things. 'Bより' marks the object being compared against, meaning 'compared to B' or 'than B'. The adjective describing A comes at the end.
  - Example: 私の家は学校より近いです。 (My house is closer than the school.)
  - kanji violations: 普校; 2242 ms
- **google/gemini-3.5-flash-lite**: 来週は今週より暑い。 (らいしゅうはこんしゅうよりあつい。)
  - EN: Next week is hotter than this week.
  - Grammar: To say A is more ~ than B, you use the pattern [A]は[B]より[adjective]. Here, '来週' (next week) is compared to '今週' (this week) using 'より' to mean it is hotter ('暑い').
  - Example: これはそれより大きい。 (This is bigger than that.)
  - kanji violations: none; 1833 ms

### 17. n5-ichiban

- **openai/gpt-6-luna**: 晩ご飯は味がいちばん大事だ。 (ばんごはんはあじがいちばんだいじだ。)
  - EN: Taste is the most important thing at dinner.
  - Grammar: 「〜がいちばん」 means “〜 is the most” or “〜 best.” Put が after the thing being ranked, followed by いちばん and the description or comparison. Here, taste is presented as the most important thing about dinner.
  - Example: 味がいちばん大事だ。 (Taste is the most important thing.)
  - kanji violations: 味; 2726 ms
- **anthropic/claude-haiku-5.5**: この店の中で、どれがいちばんおいしいですか。 (このみせのなかで、どれがいちばんおいしいですか。)
  - EN: Which one is the most delicious in this shop?
  - Grammar: 〜がいちばん is used to say that something is the most of a given quality or category. The pattern is [noun] が いちばん + adjective or verb, where いちばん means 'number one' or 'the most'. In this sentence, どれがいちばんおいしい asks which one is the most delicious.
  - Example: 私は夏がいちばん好きです。 (I like summer the most.)
  - kanji violations: none; 3392 ms
- **deepseek/deepseek-v4-flash**: 歩いて行くのが一番大丈夫です。 (あるいていくのがいちばんだいじょうぶです。)
  - EN: Walking to school is the safest.
  - Grammar: 〜がいちばん is used to say 'the most ~ is ...' or '... is the most ~'. Formed by putting が after the noun that is the subject being compared, and then いちばん (the most) followed by an adjective or description. In this sentence, 歩いて行く (walking) is the subject, and 大丈夫 (safe) is the quality being compared.
  - Example: この町が一番川が美しいです。 (This town has the most beautiful river.)
  - kanji violations: none; 9191 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 僕の町では、この店の晩ご飯がいちばん美味しい。 (ぼくのまちでは、このみせのばんごはんがいちばんおいしい。)
  - EN: In my town, the dinner at this restaurant is the most delicious.
  - Grammar: To express 'the most' in Japanese, use the pattern [noun] + が + いちばん + [adjective/adverb]. It highlights that one specific item excels above others in a group. You can place it before adjectives to compare qualities.
  - Example: 僕は一年で冬がいちばん嫌いだ。 (I like winter the least in the year.)
  - kanji violations: 味; 2536 ms
- **google/gemini-3.5-flash-lite**: 味がいちばん美味しい。 (あじがいちばんおいしい。)
  - EN: The taste is the best.
  - Grammar: The grammar pattern '〜がいちばん' means 'is the most' or 'is number one'. It is formed by attaching the subject marker 'が' to a noun, followed by 'いちばん' (the most) and an adjective or verb. In this sentence, it shows that the taste is the best among choices.
  - Example: これがいちばん良い。 (This one is the best.)
  - kanji violations: 味; 1853 ms

### 18. n5-ni-iku

- **openai/gpt-6-luna**: 日曜日に大阪へ名物を食べにいく。 (にちようびにおおさかへめいぶつをたべにいく。)
  - EN: I’m going to Osaka on Sunday to eat a local specialty.
  - Grammar: The pattern 〜にいく means “go in order to do something.” Form it by adding に to the verb stem, then いく. Here, 食べる becomes 食べ, so 食べにいく means “go to eat.”
  - Example: 名物を食べにいく。 (I’m going to eat a local specialty.)
  - kanji violations: none; 2959 ms
- **anthropic/claude-haiku-5.5**: 友だちに会いにいく。 (ともだちにあいにいく。)
  - EN: I'm going to see my friend.
  - Grammar: The pattern 〜にいく means 'go to do something', expressing the purpose of going. You attach the masu-stem (ます-form without ます) of a verb to に and then add いく. In this sentence, 会い (stem of 会う, to meet) + に + いく gives 'go to meet'. The 友だち before に is the person being met, marked with に as a target particle.
  - Example: 本を買いにいく。 (I'm going to buy a book.)
  - kanji violations: none; 3096 ms
- **deepseek/deepseek-v4-flash**: としょかん に えいが を 見 に 行く。 (としょかん に えいが を み に いく。 )
  - EN: I go to the library to watch a movie.
  - Grammar: The pattern 〜にいく means 'go to do (something)'. It is formed by taking the stem of a verb (〜ます form without ます) and adding にいく. In this sentence, 見 (mi, stem of 見る 'to watch') + にいく shows the purpose of going to the library is to watch a movie.
  - Example: こうえん に はしり に 行く。 (I go to the park to run.)
  - kanji violations: none; 6440 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 日曜日に名古屋へ名物を食べに行きます。 (にちようびになごやへめいぶつをたべにいきます。)
  - EN: I will go to Nagoya on Sunday to eat the local specialty.
  - Grammar: The construction V-stem + にいく means to go somewhere for the purpose of doing an action. You form it by taking the stem of a verb (the form before masu) and adding にいく. It clearly explains the motive for your movement.
  - Example: 友達とお姉さんに会いに行きます。 (I am going to meet my older sister with my friend.)
  - kanji violations: none; 2227 ms
- **google/gemini-3.5-flash-lite**: 私ハ手ヲ洗イニ行ク。 (わたしはてをあらいにいく。)
  - EN: I am going to wash my hands.
  - Grammar: The grammar pattern 〜にいく (ni iku) means 'go to do something'. It is attached to the stem form of a verb to indicate the purpose of going somewhere. In this sentence, 洗イ (wash) takes に to show the purpose of going (行ク).
  - Example: 私ハ本ヲ見ニ行ク。 (I am going to look at books.)
  - kanji violations: none; 1973 ms

### 19. n5-tsumori

- **openai/gpt-6-luna**: 私は後で食べ物を買うつもりです。 (わたしはあとでたべものをかうつもりです。)
  - EN: I intend to buy food later.
  - Grammar: 〜つもり expresses an intention or plan to do something. Attach it to the plain form of a verb; here, 買う (buy) is followed by つもりです. The speaker plans to buy food later.
  - Example: 私は後で休むつもりです。 (I intend to rest later.)
  - kanji violations: none; 2843 ms
- **anthropic/claude-haiku-5.5**: 明日は雨が降るつもりです。 (あしたはあめがふるつもりです。)
  - EN: I intend to go out tomorrow, even though it may rain. / I plan to ... 
  - Grammar: 〜つもり expresses an intention or plan the speaker has in mind. It attaches to the plain (dictionary or ない/た) form of a verb, such as 行くつもり or 行かないつもり. In this sentence, 降るつもり would mean the speaker intends for it to rain, so the example is better read as a plan the speaker has; the English translation reflects the intended meaning.
  - Example: 今日は家で寝るつもりです。 (I plan to stay home and sleep today.)
  - kanji violations: 降寝; 3188 ms
- **deepseek/deepseek-v4-flash**: 出会いのつもりじゃないから (であいのつもりじゃないから)
  - EN: I have no intention of eating fruit.
  - Grammar: The grammar pattern 〜つもり means 'intend to' and is used to express a plan or intention. It attaches to the plain form of a verb (dictionary form for positive, ない form for negative). In this sentence, つもり is used in its negative form つもりはない to mean 'have no intention of'. The から at the end can be omitted or used to give a reason.
  - Example: 明日勉強するつもりです。 (I intend to study tomorrow.)
  - kanji violations: none; 11692 ms
- **mistralai/mistral-small-2603**: ERROR AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations
- **google/gemini-3.1-flash-lite**: 今晩は、新しい食べ物を食べるつもりです。 (こんばんわ、あたらしいたべものをたべるつもりです。)
  - EN: Good evening, I intend to eat new food.
  - Grammar: The grammar ～つもり is used to express an intention or plan. It is formed by attaching つもり to the dictionary form of a verb. It indicates that you have the internal resolve or plan to do the action.
  - Example: 明日、町へ行くつもりです。 (I intend to go to town tomorrow.)
  - kanji violations: none; 2029 ms
- **google/gemini-3.5-flash-lite**: 来週、西へ行くつもりだ。 (らいしゅう、にしへいくつもりだ。)
  - EN: I intend to go west next week.
  - Grammar: The grammar 〜つもり expresses the speaker's intention to do something. It is formed by attaching つもり to the dictionary form of a verb. In this sentence, 行くつもりだ means 'intend to go'.
  - Example: 明日、休むつもりだ。 (I intend to rest tomorrow.)
  - kanji violations: none; 1798 ms

### 20. n5-deshou

- **openai/gpt-6-luna**: 友好は大切でしょう。 (ゆうこうはたいせつでしょう。)
  - EN: Friendship is probably important.
  - Grammar: でしょう attaches to the plain form of a sentence to express probability or a guess. With a noun or な-adjective, place でしょう directly after it. Here, 大切でしょう means that friendship is probably important.
  - Example: 水は有るでしょう。 (There is probably water.)
  - kanji violations: none; 2475 ms
- **anthropic/claude-haiku-5.5**: 明日は雨でしょう。 (あしたはあめでしょう。)
  - EN: It will probably rain tomorrow.
  - Grammar: 〜でしょう expresses a speaker's guess or probability, meaning 'probably' or 'I think'. It attaches to a noun or な-adjective with で (e.g. 雨でしょう) and to a plain verb or い-adjective directly (e.g. 行くでしょう, 高いでしょう). Here it softens the prediction that it will rain tomorrow, indicating the speaker is not completely certain.
  - Example: 彼は来るでしょう。 (He will probably come.)
  - kanji violations: none; 4431 ms
- **deepseek/deepseek-v4-flash**: その映画はとても面白いでしょう。 (そのえいがはとてもおもしろいでしょう。)
  - EN: That movie is probably very interesting.
  - Grammar: 〜でしょう is used to express probability or conjecture, similar to 'probably' in English. It attaches to the plain form of verbs, adjectives, and nouns (with だ becoming でしょう). In this sentence, 面白い (interesting) is an adjective; adding でしょう softens the statement from a fact to a guess.
  - Example: 来週のテストは簡単でしょう。 (The test next week will probably be easy.)
  - kanji violations: 映簡; 6622 ms
- **mistralai/mistral-small-2603**: この店の料理はきっとおいしいでしょう。 (このみせのりょうりはきっとおいしいでしょう。)
  - EN: The food at this restaurant is probably delicious.
  - Grammar: でしょう is a polite way to express conjecture or probability. It is formed by adding でしょう to the end of a sentence, often after an adjective or verb in its plain form. In this sentence, it softens the statement about the food being delicious, making it sound more polite and less certain.
  - Example: この映画は面白いでしょう。 (This movie is probably interesting.)
  - kanji violations: 映; 10865 ms
- **google/gemini-3.1-flash-lite**: あの会社員は本当に親友と東京弁で話すでしょう。 (あの かいしゃいんは ほんとうに しんゆうと とうきょうべんで はなすでしょう。)
  - EN: That company employee will probably speak in Tokyo dialect with his close friend.
  - Grammar: The grammar ～でしょう is used to express conjecture or probability. It is added to the end of a sentence to mean 'probably' or 'I think that'. It can be attached to verbs in the dictionary form, adjectives, and nouns.
  - Example: 明日は雨が降るでしょう。 (It will probably rain tomorrow.)
  - kanji violations: 降; 2292 ms
- **google/gemini-3.5-flash-lite**: 明日 は 雨 が 降る でしょう。 (あした は あめ が ふる でしょう。)
  - EN: It will probably rain tomorrow.
  - Grammar: The ending 〜でしょう expresses probability or conjecture, similar to 'probably' or 'might' in English. It attaches to the plain form of verbs, adjectives, or nouns. In this sentence, it softens the statement about tomorrow's weather.
  - Example: 明日は車が多いでしょう。 (There will probably be many cars tomorrow.)
  - kanji violations: 降; 1914 ms

## Grading

| Model | In band | Max spread between reps | Median ms | Avg cost $ |
|---|---|---|---|---|
| openai/gpt-6-luna | 47/48 | 20 | 1679 | 0.000047 |
| anthropic/claude-haiku-5.5 | 34/48 | 10 | 1572 | 0.000100 |
| deepseek/deepseek-v4-flash | 39/48 | 80 | 2487 | 0.000023 |
| mistralai/mistral-small-2603 | 18/20 | 5 | 3632 | 0.000040 |
| google/gemini-3.1-flash-lite | 43/48 | 10 | 1220 | 0.000115 |
| google/gemini-3.5-flash-lite | 46/48 | 5 | 1131 | 0.000163 |

| Model | Japanese | Answer | Band | Scores | Feedback (rep 1) |
|---|---|---|---|---|---|
| openai/gpt-6-luna | 昨日、友達と映画を見に行きました。 | I went to watch a film with my friend yesterday. | 90–100 | 100, 100 | Correct. It preserves the meaning, including going to see a film with a friend yesterday. |
| anthropic/claude-haiku-5.5 | 昨日、友達と映画を見に行きました。 | I went to watch a film with my friend yesterday. | 90–100 | 96, 97 | The meaning matches fully: yesterday, with a friend, went to watch a movie. The purpose sense of 〜に行く is captured well. |
| deepseek/deepseek-v4-flash | 昨日、友達と映画を見に行きました。 | I went to watch a film with my friend yesterday. | 90–100 | 95, 100 | Meaning is identical; only phrasing differs. |
| mistralai/mistral-small-2603 | 昨日、友達と映画を見に行きました。 | I went to watch a film with my friend yesterday. | 90–100 | 95, 95 | Meaning is fully preserved. |
| google/gemini-3.1-flash-lite | 昨日、友達と映画を見に行きました。 | I went to watch a film with my friend yesterday. | 90–100 | 100, 100 | Perfect! Your translation accurately reflects the meaning and purpose of the action. |
| google/gemini-3.5-flash-lite | 昨日、友達と映画を見に行きました。 | I went to watch a film with my friend yesterday. | 90–100 | 100, 100 | The meaning is the same; only phrasing differs. |
| openai/gpt-6-luna | 昨日、友達と映画を見に行きました。 | Yesterday I went to see a movie. | 70–89 | 85, 90 | The main meaning is correct, but the answer omits that you went with a friend. |
| anthropic/claude-haiku-5.5 | 昨日、友達と映画を見に行きました。 | Yesterday I went to see a movie. | 70–89 | 72, 72 | The core meaning is right: you went to see a movie yesterday. However, you left out 'with a friend' (友達と), which is a key detail of the sentence. |
| deepseek/deepseek-v4-flash | 昨日、友達と映画を見に行きました。 | Yesterday I went to see a movie. | 70–89 | 85, 80 | The translation correctly conveys going to see a movie yesterday, but it omits 'with a friend,' which is a key detail in the Japanese. |
| mistralai/mistral-small-2603 | 昨日、友達と映画を見に行きました。 | Yesterday I went to see a movie. | 70–89 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 昨日、友達と映画を見に行きました。 | Yesterday I went to see a movie. | 70–89 | 80, 80 | The meaning is mostly correct but you omitted the detail that the activity was done with a friend. |
| google/gemini-3.5-flash-lite | 昨日、友達と映画を見に行きました。 | Yesterday I went to see a movie. | 70–89 | 85, 80 | The core meaning is correct, but the detail of going with a friend was omitted. |
| openai/gpt-6-luna | 昨日、友達と映画を見に行きました。 | Tomorrow I will go see a movie with a friend. | 40–69 | 60, 40 | The activity and going with a friend are right, but the time is wrong: the Japanese says yesterday, not tomorrow. |
| anthropic/claude-haiku-5.5 | 昨日、友達と映画を見に行きました。 | Tomorrow I will go see a movie with a friend. | 40–69 | 35, 35 | The time is wrong: 昨日 means yesterday, but your answer says tomorrow, and the past tense 'went' became future 'will go'. The rest of the meaning (going to see a movie with a friend) is right. |
| deepseek/deepseek-v4-flash | 昨日、友達と映画を見に行きました。 | Tomorrow I will go see a movie with a friend. | 40–69 | 50, 30 | The tense is wrong: the Japanese sentence says 'yesterday' (past), but your answer says 'tomorrow' (future). |
| mistralai/mistral-small-2603 | 昨日、友達と映画を見に行きました。 | Tomorrow I will go see a movie with a friend. | 40–69 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 昨日、友達と映画を見に行きました。 | Tomorrow I will go see a movie with a friend. | 40–69 | 40, 40 | The tense is incorrect. You translated yesterday as tomorrow, which changes the meaning of when the action happened. |
| google/gemini-3.5-flash-lite | 昨日、友達と映画を見に行きました。 | Tomorrow I will go see a movie with a friend. | 40–69 | 40, 40 | The tense is wrong; it should be past tense instead of future. |
| openai/gpt-6-luna | 昨日、友達と映画を見に行きました。 | I like eating apples. | 0–39 | 0, 0 | The answer is unrelated to the Japanese sentence and does not express going to see a movie with a friend yesterday. |
| anthropic/claude-haiku-5.5 | 昨日、友達と映画を見に行きました。 | I like eating apples. | 0–39 | 3, 2 | The learner's answer is about liking to eat apples, which is unrelated to the Japanese sentence about going to see a movie with a friend yesterday. The meaning does not match at all. |
| deepseek/deepseek-v4-flash | 昨日、友達と映画を見に行きました。 | I like eating apples. | 0–39 | 0, 0 | The answer is completely unrelated to the Japanese sentence; it talks about liking apples instead of going to see a movie. |
| mistralai/mistral-small-2603 | 昨日、友達と映画を見に行きました。 | I like eating apples. | 0–39 | 0, 0 | The learner's sentence has no connection to the Japanese source. |
| google/gemini-3.1-flash-lite | 昨日、友達と映画を見に行きました。 | I like eating apples. | 0–39 | 0, 0 | The meaning is completely unrelated to the original Japanese sentence. |
| google/gemini-3.5-flash-lite | 昨日、友達と映画を見に行きました。 | I like eating apples. | 0–39 | 0, 0 | The translation is completely unrelated to the Japanese sentence. |
| openai/gpt-6-luna | 窓を開けてもいいですか。 | Is it ok if I open the window? | 90–100 | 100, 100 | Correct. It asks for permission to open the window. |
| anthropic/claude-haiku-5.5 | 窓を開けてもいいですか。 | Is it ok if I open the window? | 90–100 | 92, 92 | Your answer captures the meaning of asking permission to open the window, with the 〜てもいい permission nuance well conveyed. The phrasing differs from the reference but the meaning is the same. |
| deepseek/deepseek-v4-flash | 窓を開けてもいいですか。 | Is it ok if I open the window? | 90–100 | 95, 95 | Meaning is identical; only phrasing differs. |
| mistralai/mistral-small-2603 | 窓を開けてもいいですか。 | Is it ok if I open the window? | 90–100 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 窓を開けてもいいですか。 | Is it ok if I open the window? | 90–100 | 100, 100 | Perfect meaning. Your phrasing is natural. |
| google/gemini-3.5-flash-lite | 窓を開けてもいいですか。 | Is it ok if I open the window? | 90–100 | 100, 100 | The meaning is the same; only the phrasing differs. |
| openai/gpt-6-luna | 窓を開けてもいいですか。 | Please open the window. | 40–69 | 45, 40 | The answer asks someone to open the window, rather than asking permission for the speaker to open it. |
| anthropic/claude-haiku-5.5 | 窓を開けてもいいですか。 | Please open the window. | 40–69 | 15, 15 | The learner's answer is a request to someone else, not a request for permission. The grammar 〜てもいい asks whether the speaker may do the action, so the meaning of the target pattern is missing. |
| deepseek/deepseek-v4-flash | 窓を開けてもいいですか。 | Please open the window. | 40–69 | 20, 60 | The learner answer does not express a request for permission; it is a polite command. |
| mistralai/mistral-small-2603 | 窓を開けてもいいですか。 | Please open the window. | 40–69 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 窓を開けてもいいですか。 | Please open the window. | 40–69 | 50, 40 | You mistook a request for permission for a command. |
| google/gemini-3.5-flash-lite | 窓を開けてもいいですか。 | Please open the window. | 40–69 | 40, 40 | The meaning of asking for permission is wrong; it translates to a request to open the window instead. |
| openai/gpt-6-luna | 窓を開けてもいいですか。 | I opened the window. | 0–49 | 40, 40 | The answer says you opened the window, but the Japanese is asking for permission to open it. |
| anthropic/claude-haiku-5.5 | 窓を開けてもいいですか。 | I opened the window. | 0–49 | 15, 5 | The learner's answer states a completed action (I opened the window) instead of asking permission. The ～てもいいですか pattern asks whether something is allowed, so the permission meaning is missing. |
| deepseek/deepseek-v4-flash | 窓を開けてもいいですか。 | I opened the window. | 0–49 | 30, 30 | The learner translated the sentence as a past-tense statement, not a request for permission. The meaning of '〜てもいいですか' is completely lost. |
| mistralai/mistral-small-2603 | 窓を開けてもいいですか。 | I opened the window. | 0–49 | 40, 40 | Wrong tense; learner used past instead of asking permission. |
| google/gemini-3.1-flash-lite | 窓を開けてもいいですか。 | I opened the window. | 0–49 | 40, 40 | The meaning is incorrect because the sentence is a request for permission, not a statement about an action you have already performed. |
| google/gemini-3.5-flash-lite | 窓を開けてもいいですか。 | I opened the window. | 0–49 | 40, 40 | The tense and sentence type are wrong. It is a question asking for permission, not a past action. |
| openai/gpt-6-luna | 雨が降っているから、家にいます。 | I'm staying home since it's raining | 90–100 | 100, 100 | Correct. “Since” appropriately expresses the reason, and the rest of the meaning is preserved. |
| anthropic/claude-haiku-5.5 | 雨が降っているから、家にいます。 | I'm staying home since it's raining | 90–100 | 96, 96 | The meaning matches: you correctly expressed that staying home is because of the rain, and used 'since' for the から reason. Only the phrasing differs from the reference. |
| deepseek/deepseek-v4-flash | 雨が降っているから、家にいます。 | I'm staying home since it's raining | 90–100 | 96, 95 | Meaning is correct and natural; only phrasing differs. |
| mistralai/mistral-small-2603 | 雨が降っているから、家にいます。 | I'm staying home since it's raining | 90–100 | 95, 95 | Meaning is correct; only 'since' instead of 'because' differs. |
| google/gemini-3.1-flash-lite | 雨が降っているから、家にいます。 | I'm staying home since it's raining | 90–100 | 100, 100 | Perfect. You captured the meaning exactly. |
| google/gemini-3.5-flash-lite | 雨が降っているから、家にいます。 | I'm staying home since it's raining | 90–100 | 100, 100 | The meaning is the same. |
| openai/gpt-6-luna | 雨が降っているから、家にいます。 | It is raining and I am at home | 60–89 | 70, 70 | The main ideas are present, but “and” does not express the cause-and-effect relationship of 〜から. |
| anthropic/claude-haiku-5.5 | 雨が降っているから、家にいます。 | It is raining and I am at home | 60–89 | 35, 35 | The learner's answer uses 'and' instead of showing a causal link. The から clause means 'because', so the reason-result relationship is missing, which changes the core meaning. |
| deepseek/deepseek-v4-flash | 雨が降っているから、家にいます。 | It is raining and I am at home | 60–89 | 40, 100 | The learner's answer uses 'and' instead of 'because', missing the cause-effect relationship between the rain and staying home. That is a key grammatical error. |
| mistralai/mistral-small-2603 | 雨が降っているから、家にいます。 | It is raining and I am at home | 60–89 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 雨が降っているから、家にいます。 | It is raining and I am at home | 60–89 | 60, 60 | You missed the causal relationship expressed by the grammar point. The target implies staying home because of the rain, rather than simply stating two facts. |
| google/gemini-3.5-flash-lite | 雨が降っているから、家にいます。 | It is raining and I am at home | 60–89 | 85, 80 | The core meaning is correct, but the causal relationship expressed by 'kara' is missing. |
| openai/gpt-6-luna | 雨が降っているから、家にいます。 | Because it isn't raining, I'm staying home. | 40–69 | 40, 40 | The reason is negated: 「雨が降っている」 means it is raining, not that it isn't raining. |
| anthropic/claude-haiku-5.5 | 雨が降っているから、家にいます。 | Because it isn't raining, I'm staying home. | 40–69 | 15, 8 | The learner negated the rain, but the Japanese says it IS raining (降っている is affirmative). The 'because' clause is therefore reversed, which changes the core meaning. |
| deepseek/deepseek-v4-flash | 雨が降っているから、家にいます。 | Because it isn't raining, I'm staying home. | 40–69 | 30, 30 | The meaning is reversed: you said 'isn't raining', but the Japanese says it *is* raining. |
| mistralai/mistral-small-2603 | 雨が降っているから、家にいます。 | Because it isn't raining, I'm staying home. | 40–69 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 雨が降っているから、家にいます。 | Because it isn't raining, I'm staying home. | 40–69 | 40, 40 | The meaning is incorrect because the sentence is about rain falling, not the absence of rain. |
| google/gemini-3.5-flash-lite | 雨が降っているから、家にいます。 | Because it isn't raining, I'm staying home. | 40–69 | 40, 40 | The negation of the verb is incorrect; it should mean that it is raining, not that it isn't. |
| openai/gpt-6-luna | この本は読みやすいです。 | this book is easy to raed | 90–100 | 100, 100 | The meaning matches the Japanese; the spelling error does not affect the meaning. |
| anthropic/claude-haiku-5.5 | この本は読みやすいです。 | this book is easy to raed | 90–100 | 97, 97 | The meaning matches exactly: the book is easy to read. The only issue is the spelling of 'read'. |
| deepseek/deepseek-v4-flash | この本は読みやすいです。 | this book is easy to raed | 90–100 | 95, 98 | Meaning is exactly correct. |
| mistralai/mistral-small-2603 | この本は読みやすいです。 | this book is easy to raed | 90–100 | 40, 40 | The verb 'read' is misspelled as 'raed', changing the meaning. |
| google/gemini-3.1-flash-lite | この本は読みやすいです。 | this book is easy to raed | 90–100 | 100, 100 | Correct meaning. Well done. |
| google/gemini-3.5-flash-lite | この本は読みやすいです。 | this book is easy to raed | 90–100 | 100, 100 | Accurate meaning with a minor spelling typo. |
| openai/gpt-6-luna | この本は読みやすいです。 | This book is hard to read. | 0–49 | 40, 40 | The sentence says the book is easy to read, but your answer says it is hard to read. |
| anthropic/claude-haiku-5.5 | この本は読みやすいです。 | This book is hard to read. | 0–49 | 10, 5 | The learner said 'hard to read', but 読みやすい means 'easy to read'. The 〜やすい vs 〜にくい meaning is reversed, which changes the core meaning. |
| deepseek/deepseek-v4-flash | この本は読みやすいです。 | This book is hard to read. | 0–49 | 0, 20 | You changed 'easy' to 'hard', which reverses the meaning of the target grammar 〜やすい (easy to). |
| mistralai/mistral-small-2603 | この本は読みやすいです。 | This book is hard to read. | 0–49 | 40, 40 | The learner wrote 'hard' instead of 'easy'. |
| google/gemini-3.1-flash-lite | この本は読みやすいです。 | This book is hard to read. | 0–49 | 40, 40 | You identified the wrong meaning for the target grammar. It indicates 'easy to' rather than 'hard to'. |
| google/gemini-3.5-flash-lite | この本は読みやすいです。 | This book is hard to read. | 0–49 | 40, 40 | The polarity of the target grammar was reversed; the Japanese means easy to read, not hard to read. |
| openai/gpt-6-luna | この本は読みやすいです。 | This book is interesting. | 20–60 | 40, 40 | The sentence identifies the book, but 「読みやすい」 means it is easy to read, not interesting. |
| anthropic/claude-haiku-5.5 | この本は読みやすいです。 | This book is interesting. | 20–60 | 20, 25 | 読みやすい means 'easy to read,' not 'interesting.' The learner's answer changes the meaning to describing the book's content rather than how easy it is to read. |
| deepseek/deepseek-v4-flash | この本は読みやすいです。 | This book is interesting. | 20–60 | 30, 25 | The meaning is off: 'interesting' does not match 'easy to read'. |
| mistralai/mistral-small-2603 | この本は読みやすいです。 | This book is interesting. | 20–60 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | この本は読みやすいです。 | This book is interesting. | 20–60 | 50, 50 | The word interesting does not capture the meaning of the grammar point regarding ease of reading. |
| google/gemini-3.5-flash-lite | この本は読みやすいです。 | This book is interesting. | 20–60 | 40, 40 | The meaning of the key content word 'easy to read' was changed to 'interesting'. |
| openai/gpt-6-luna | 先生に褒められました。 | The teacher praised me. | 90–100 | 100, 100 | Correct: it conveys that the teacher praised you. |
| anthropic/claude-haiku-5.5 | 先生に褒められました。 | The teacher praised me. | 90–100 | 35, 35 | The learner's answer uses the active voice, so it loses the passive meaning that the target grammar requires. The Japanese says the speaker received the praise, with the teacher as the one doing it, not the teacher as the subject. |
| deepseek/deepseek-v4-flash | 先生に褒められました。 | The teacher praised me. | 90–100 | 95, 95 | The meaning is identical; the active voice simply changes the phrasing. |
| mistralai/mistral-small-2603 | 先生に褒められました。 | The teacher praised me. | 90–100 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 先生に褒められました。 | The teacher praised me. | 90–100 | 85, 85 | The core meaning is correct, but the sentence is active rather than passive. |
| google/gemini-3.5-flash-lite | 先生に褒められました。 | The teacher praised me. | 90–100 | 40, 40 | The passive voice was reversed, making the teacher the one doing the praising instead of the receiver. |
| openai/gpt-6-luna | 先生に褒められました。 | I praised the teacher. | 0–49 | 40, 40 | The passive meaning is reversed: the teacher praised you, rather than you praising the teacher. |
| anthropic/claude-haiku-5.5 | 先生に褒められました。 | I praised the teacher. | 0–49 | 10, 10 | The learner reversed the direction of the action: 褒められました is passive, meaning the speaker was praised by the teacher, not the one who praised. The passive sense 'is done (to)' is missing. |
| deepseek/deepseek-v4-flash | 先生に褒められました。 | I praised the teacher. | 0–49 | 30, 20 | You reversed who did the praising and who received it. In the Japanese passive, the teacher is the agent and 'I' am the recipient. |
| mistralai/mistral-small-2603 | 先生に褒められました。 | I praised the teacher. | 0–49 | 40, 40 | The learner reversed who does what; the passive form (褒められました) means 'was praised,' not 'praised'. |
| google/gemini-3.1-flash-lite | 先生に褒められました。 | I praised the teacher. | 0–49 | 40, 40 | You mixed up the subject and the object; the teacher did the praising, not you. |
| google/gemini-3.5-flash-lite | 先生に褒められました。 | I praised the teacher. | 0–49 | 40, 40 | The direction of the action is reversed; you made the speaker praise the teacher instead of being praised by the teacher. |
| openai/gpt-6-luna | 日本に行ったことがあります。 | I have gone to Japan before | 90–100 | 100, 100 | Correct: it expresses that you have visited Japan before. |
| anthropic/claude-haiku-5.5 | 日本に行ったことがあります。 | I have gone to Japan before | 90–100 | 92, 92 | Your meaning matches the Japanese: the experience of having gone to Japan before, which is the ～たことがある sense. Phrasing differs from the reference but the meaning is the same. |
| deepseek/deepseek-v4-flash | 日本に行ったことがあります。 | I have gone to Japan before | 90–100 | 95, 95 | The meaning is essentially the same; 'have gone' versus 'have been' is a phrasing difference here, not a meaning error. |
| mistralai/mistral-small-2603 | 日本に行ったことがあります。 | I have gone to Japan before | 90–100 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 日本に行ったことがあります。 | I have gone to Japan before | 90–100 | 85, 85 | The core meaning is correct, but 'have gone' suggests you are still there or focus on the travel action, whereas 'have been' signifies the experience of visiting. |
| google/gemini-3.5-flash-lite | 日本に行ったことがあります。 | I have gone to Japan before | 90–100 | 100, 100 | Same meaning. The addition of 'before' fits the grammar well. |
| openai/gpt-6-luna | 日本に行ったことがあります。 | I went to Japan. | 60–89 | 70, 65 | The answer says the speaker went to Japan, but it describes a past trip rather than explicitly saying they have been there before. |
| anthropic/claude-haiku-5.5 | 日本に行ったことがあります。 | I went to Japan. | 60–89 | 35, 35 | The learner wrote 'went' (simple past), which describes a single completed trip. The target grammar 〜たことがある expresses past experience, meaning 'have been to' or 'have done before,' so the present perfect experience sense is missing. |
| deepseek/deepseek-v4-flash | 日本に行ったことがあります。 | I went to Japan. | 60–89 | 60, 75 | The learner's answer uses simple past tense, which states a past action but loses the experiential meaning ('have done before') of the target grammar. This is a key element off. |
| mistralai/mistral-small-2603 | 日本に行ったことがあります。 | I went to Japan. | 60–89 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 日本に行ったことがあります。 | I went to Japan. | 60–89 | 60, 60 | You missed the aspect of experience that indicates you have been there at least once in your life, as opposed to a simple past tense event. |
| google/gemini-3.5-flash-lite | 日本に行ったことがあります。 | I went to Japan. | 60–89 | 75, 75 | The core meaning is right, but it misses the specific experience nuance of '〜たことがある' (have been/done before), translating it as a simple past action instead. |
| openai/gpt-6-luna | 日本に行ったことがあります。 | I want to go to Japan. | 0–49 | 45, 40 | The answer says you want to go to Japan, but the Japanese says you have been there before. |
| anthropic/claude-haiku-5.5 | 日本に行ったことがあります。 | I want to go to Japan. | 0–49 | 15, 15 | The learner's answer expresses a desire to go to Japan, but the Japanese describes past experience (having been there before). The target grammar 〜たことがある, meaning 'have done before,' is missing from the meaning. |
| deepseek/deepseek-v4-flash | 日本に行ったことがあります。 | I want to go to Japan. | 0–49 | 0, 10 | The learner's answer expresses a desire to go to Japan, not the experience of having been there. The meaning is completely different. |
| mistralai/mistral-small-2603 | 日本に行ったことがあります。 | I want to go to Japan. | 0–49 | 40, 40 | Negation is missing; learner used 'want to' instead of 'have been'. |
| google/gemini-3.1-flash-lite | 日本に行ったことがあります。 | I want to go to Japan. | 0–49 | 50, 40 | You mistook the past experience grammar for a desire to go. |
| google/gemini-3.5-flash-lite | 日本に行ったことがあります。 | I want to go to Japan. | 0–49 | 40, 40 | The translation expresses desire instead of past experience. |
| openai/gpt-6-luna | 寝る前に歯を磨いてください。 | Brush your teeth before you sleep, please. | 90–100 | 100, 100 | Correct. “Before you sleep” conveys the same timing as before going to bed. |
| anthropic/claude-haiku-5.5 | 寝る前に歯を磨いてください。 | Brush your teeth before you sleep, please. | 90–100 | 95, 95 | The meaning matches: brushing teeth before sleeping, as a polite request. Your phrasing 'before you sleep' is a natural equivalent of 寝る前に. |
| deepseek/deepseek-v4-flash | 寝る前に歯を磨いてください。 | Brush your teeth before you sleep, please. | 90–100 | 95, 100 | The meaning is accurately conveyed with only natural phrasing differences. |
| mistralai/mistral-small-2603 | 寝る前に歯を磨いてください。 | Brush your teeth before you sleep, please. | 90–100 | 95, 95 | Meaning is correct; only phrasing differs slightly. |
| google/gemini-3.1-flash-lite | 寝る前に歯を磨いてください。 | Brush your teeth before you sleep, please. | 90–100 | 100, 100 | Perfect! Your translation captures the meaning perfectly. |
| google/gemini-3.5-flash-lite | 寝る前に歯を磨いてください。 | Brush your teeth before you sleep, please. | 90–100 | 100, 100 | The meaning is the same; only the phrasing differs. |
| openai/gpt-6-luna | 寝る前に歯を磨いてください。 | Please brush your teeth after going to bed. | 40–69 | 40, 40 | The meaning of 「寝る前に」 is “before going to bed,” but your answer says “after going to bed.” |
| anthropic/claude-haiku-5.5 | 寝る前に歯を磨いてください。 | Please brush your teeth after going to bed. | 40–69 | 10, 10 | The learner used 'after' instead of 'before', which reverses the meaning of 〜前に. The rest of the sentence is fine, but this key element is wrong. |
| deepseek/deepseek-v4-flash | 寝る前に歯を磨いてください。 | Please brush your teeth after going to bed. | 40–69 | 40, 30 | The meaning is reversed: you said 'after' instead of 'before'. |
| mistralai/mistral-small-2603 | 寝る前に歯を磨いてください。 | Please brush your teeth after going to bed. | 40–69 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 寝る前に歯を磨いてください。 | Please brush your teeth after going to bed. | 40–69 | 40, 40 | You mixed up 'before' and 'after'. |
| google/gemini-3.5-flash-lite | 寝る前に歯を磨いてください。 | Please brush your teeth after going to bed. | 40–69 | 40, 40 | The preposition 'after' is used instead of 'before', which reverses the meaning. |
| openai/gpt-6-luna | 寝る前に歯を磨いてください。 | (empty) | 0–10 | 0, 0 | No translation was provided. |
| anthropic/claude-haiku-5.5 | 寝る前に歯を磨いてください。 | (empty) | 0–10 | 0, 0 | The learner answer is empty, so no meaning was conveyed. Please provide a translation of the Japanese sentence. |
| deepseek/deepseek-v4-flash | 寝る前に歯を磨いてください。 | (empty) | 0–10 | 100, 20 | The meaning is fully conveyed. |
| mistralai/mistral-small-2603 | 寝る前に歯を磨いてください。 | (empty) | 0–10 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 寝る前に歯を磨いてください。 | (empty) | 0–10 | 0, 0 | No answer was provided to grade. |
| google/gemini-3.5-flash-lite | 寝る前に歯を磨いてください。 | (empty) | 0–10 | 0, 0 | The learner answer is empty. |
| openai/gpt-6-luna | 薬を飲まなければなりません。 | I must take my medicine. | 90–100 | 100, 100 | Correct. “My medicine” preserves the meaning of taking medicine. |
| anthropic/claude-haiku-5.5 | 薬を飲まなければなりません。 | I must take my medicine. | 90–100 | 93, 92 | Correct meaning: the obligation to take medicine is conveyed well. 'My' is a minor addition that doesn't change the sense, and 'must' accurately expresses 〜なければならない. |
| deepseek/deepseek-v4-flash | 薬を飲まなければなりません。 | I must take my medicine. | 90–100 | 95, 95 | Perfect match in meaning. The slight difference ('my medicine' vs 'medicine') doesn't change anything. |
| mistralai/mistral-small-2603 | 薬を飲まなければなりません。 | I must take my medicine. | 90–100 | 100, 95 | Perfect match in meaning. |
| google/gemini-3.1-flash-lite | 薬を飲まなければなりません。 | I must take my medicine. | 90–100 | 100, 100 | Your translation is correct and captures the meaning perfectly. |
| google/gemini-3.5-flash-lite | 薬を飲まなければなりません。 | I must take my medicine. | 90–100 | 100, 100 | Accurate meaning conveyed successfully. |
| openai/gpt-6-luna | 薬を飲まなければなりません。 | I have to drink medicine | 85–100 | 100, 100 | Correct. “Drink medicine” conveys taking medicine here. |
| anthropic/claude-haiku-5.5 | 薬を飲まなければなりません。 | I have to drink medicine | 85–100 | 92, 92 | The meaning matches: obligation to take the medicine. 'Drink' is a natural alternative to 'take' for medicine in this context. |
| deepseek/deepseek-v4-flash | 薬を飲まなければなりません。 | I have to drink medicine | 85–100 | 95, 100 | The meaning is identical; only the verb choice differs ('drink' vs. 'take'), which carries the same sense here. |
| mistralai/mistral-small-2603 | 薬を飲まなければなりません。 | I have to drink medicine | 85–100 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 薬を飲まなければなりません。 | I have to drink medicine | 85–100 | 100, 100 | Correct meaning. Using 'drink' for medicine is perfectly acceptable in this context. |
| google/gemini-3.5-flash-lite | 薬を飲まなければなりません。 | I have to drink medicine | 85–100 | 95, 95 | The meaning is correct, though in English we usually say 'take' medicine rather than 'drink'. |
| openai/gpt-6-luna | 薬を飲まなければなりません。 | I don't have to take medicine. | 0–49 | 40, 45 | The answer reverses the meaning: 「飲まなければなりません」 says taking medicine is required, not that it is unnecessary. |
| anthropic/claude-haiku-5.5 | 薬を飲まなければなりません。 | I don't have to take medicine. | 0–49 | 15, 15 | The learner used 'don't have to,' which means no obligation, but the Japanese 〜なければならない expresses obligation (must). The negation is reversed, so the core meaning is wrong. |
| deepseek/deepseek-v4-flash | 薬を飲まなければなりません。 | I don't have to take medicine. | 0–49 | 30, 40 | The meaning is opposite: you wrote 'don't have to', but the Japanese means 'must/have to'. |
| mistralai/mistral-small-2603 | 薬を飲まなければなりません。 | I don't have to take medicine. | 0–49 | ERR, ERR | AI_RetryError: Failed after 3 attempts. Last error: AI_APICallError: [Mistral] mistralai/mistral-small-2603 is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations |
| google/gemini-3.1-flash-lite | 薬を飲まなければなりません。 | I don't have to take medicine. | 0–49 | 40, 40 | You mistook the obligation for a lack of obligation. The Japanese indicates you must perform the action. |
| google/gemini-3.5-flash-lite | 薬を飲まなければなりません。 | I don't have to take medicine. | 0–49 | 40, 40 | The polarity is wrong; the Japanese expresses obligation, but the translation expresses a lack of obligation. |

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