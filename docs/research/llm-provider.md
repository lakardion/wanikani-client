# LLM provider for exercise generation and grading

Research for lakardion/wanikani-client#4. All prices, model names, and limits come from first-party pages and the npm registry, read on 2026-10-10. Prices are USD per 1M tokens, standard (non-batch) tier.

## Bottom line

- **Cost is not a deciding factor at this volume.** At ~50 calls/day the cheapest paid small models cost about **$1–5 per month** (see §2). The Gemini free tier makes it $0.
- **All three providers enforce a JSON Schema at the API level.** OpenAI is the only one that also enforces numeric `minimum`/`maximum` at decode time (useful for the 0–100 score). Anthropic rejects those keywords; Gemini accepts them but tells you to validate values yourself. In every case, validate with Zod on the server.
- **No provider publishes a Japanese/JLPT benchmark** that answers "does it respect a constrained vocab/kanji list". This must be measured by an eval in #7, not decided from docs.
- **Recommendation:** Vercel AI SDK (`ai` + one `@ai-sdk/*` provider) with `generateText` + `Output.object` and a Zod schema, non-streaming. Start on **Gemini `gemini-3.5-flash-lite` (free tier)**; move generation to `gemini-3.8-flash` if the eval shows constraint violations. **Fallback:** a paid small model, **`gpt-6-luna`** (or `claude-haiku-5-5`, same price), at ~$1.30/month.

---

## 1. Current lineups (small/cheap tier) and prices

| Provider | Model ID | Input | Output | Notes | Source |
| --- | --- | --- | --- | --- | --- |
| Google | `gemini-3.5-flash-lite` | $0.30 | $2.50 | Stable; "fastest, most cost-effective 3.5 model"; free tier: yes | [pricing](https://ai.google.dev/gemini-api/docs/pricing), [models](https://ai.google.dev/gemini-api/docs/models) |
| Google | `gemini-3.8-flash` | $0.75 → $1.50 from 2027-01-01 | $3.75 → $7.50 from 2027-01-01 | Stable, newest Flash; free tier: yes | [pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| Google | `gemini-3.1-flash-lite` | $0.25 | $1.50 | Stable; free tier: yes | [pricing](https://ai.google.dev/gemini-api/docs/pricing) |
| OpenAI | `gpt-6-luna` | $0.10 (cached $0.01) | $0.50 | "Our most efficient model for focused, high-volume tasks"; reasoning effort `none`…`max` | [pricing](https://developers.openai.com/api/docs/pricing), [models](https://developers.openai.com/api/docs/models) |
| OpenAI | `gpt-5.6-luna` | $0.20 | $1.20 | Previous generation | [pricing](https://developers.openai.com/api/docs/pricing) |
| OpenAI | `gpt-6.1-sol` | $2.00 | $10.00 | Mid tier, for comparison | [pricing](https://developers.openai.com/api/docs/pricing) |
| Anthropic | `claude-haiku-5-5` | $0.10 (prompts ≤100k tokens) | $0.50 | Latency "Fastest"; adaptive thinking, default effort `medium` | [pricing](https://platform.claude.com/docs/en/about-claude/pricing), [models](https://platform.claude.com/docs/en/about-claude/models/overview) |
| Anthropic | `claude-sonnet-5-5` | $2.00 | $10.00 | Latency "Fast", for comparison | same |

Thinking tokens bill as output on all three. Gemini: "response pricing is the sum of output tokens and thinking tokens"; `gemini-3.8-flash` thinks at `medium` by default (lowest is `low`), `gemini-3.5-flash-lite` at `minimal` ([thinking](https://ai.google.dev/gemini-api/docs/thinking)). OpenAI `gpt-6-luna` accepts reasoning effort `none` ([models](https://developers.openai.com/api/docs/models)). Set the lowest effort level for both tasks, and raise it only if the eval needs it.

## 2. Free / cheap tier at ~50 calls/day

**Cost model (assumption):** 25 generations/day at ~10k input tokens (known-vocab list of ~2,000 items plus the prompt) and ~1k output tokens including thinking; 25 gradings/day at ~1k input and ~300 output. That gives ~8.25M input and ~1M output tokens per month.

| Model | Est. monthly cost (paid) |
| --- | --- |
| `gpt-6-luna` / `claude-haiku-5-5` | ~$1.31 |
| `gpt-5.6-luna` | ~$2.82 |
| `gemini-3.5-flash-lite` | ~$4.91 |
| `gemini-3.8-flash` | ~$9.84 (~$19.69 after the 2027 price change) |
| `claude-sonnet-5-5` / `gpt-6.1-sol` | ~$26.25 |

The known-vocab list dominates input cost. If #6 sends a smaller list (for example, a sample per exercise), the costs fall in proportion.

**Free tiers:**

- **Gemini** has a real free tier on `gemini-3.5-flash-lite`, `gemini-3.8-flash`, and others ([pricing](https://ai.google.dev/gemini-api/docs/pricing)). Limits are RPM/TPM/RPD, "applied per project, not per API key", RPD resets "at midnight Pacific time", and the docs do not print the numbers: they "can be viewed in Google AI Studio" ([rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)). Third-party figures conflict, so check AI Studio before relying on it. Caveats from the [Gemini API terms](https://ai.google.dev/gemini-api/terms):
  - Free-tier content is used to improve Google products, and "human reviewers may read, annotate, and process your API input and output". Inputs here (vocab lists, the owner's translations) are not sensitive, so this is acceptable.
  - "You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom." For users in those regions, the paid data-use terms apply even to unpaid quota. **If the owner is in the EEA/CH/UK, the free tier is likely not allowed for this app** (see open questions).
- **OpenAI** lists a Free usage tier ("User must be in an allowed geography", "$100 / month" usage limit), but the docs give no free-tier rate limits or model list. The Build tier needs "$5 in total credit purchases" ([rate limits](https://developers.openai.com/api/docs/guides/rate-limits)).
- **Anthropic** has no free tier. New orgs start in an Evaluation or Start tier; Start has a $500/month spend cap. You can set your own lower spend limit in the Console, and requests then fail with HTTP 400 `invalid_request_error` ([rate limits](https://platform.claude.com/docs/en/api/rate-limits)). This works as a provider-side cost backstop.
- **Vercel AI Gateway** charges "no markup and no platform fee on tokens" and has a free tier with "a subset of models" and lower rate limits. The docs do not state the free credit amount. BYOK needs purchased credits ([AI Gateway pricing](https://vercel.com/docs/ai-gateway/pricing)). It adds nothing that this app needs, so skip it.

## 3. Structured output (JSON Schema enforcement)

| | Gemini | OpenAI | Anthropic |
| --- | --- | --- | --- |
| Mechanism | `responseMimeType: "application/json"` + `responseJsonSchema` in `@google/genai` `generateContent` config (field present in `@google/genai@2.28.0` typings) | Responses API `text.format: { type: "json_schema", strict: true }` | `output_config.format: { type: "json_schema", schema }`; also `strict: true` on tools |
| Guarantee | "output is syntactically correct JSON, always validate values in your application" | "ensures the model will always generate responses that adhere to your supplied JSON Schema" | "guarantee schema-compliant responses through constrained decoding" |
| Numeric range (score 0–100) | `minimum`/`maximum` listed as supported | `minimum`/`maximum` supported | **Not supported** (400 error); the Zod helper strips them into descriptions and re-validates |
| Other rules | Subset of JSON Schema; "very large or deeply nested schemas may be rejected" | All fields `required`; `additionalProperties: false`; root must be an object | `additionalProperties: false`; no `minLength`/`maxLength`; enum casing not guaranteed |
| Failure cases | Semantically wrong values | `refusal` field; incomplete at `max_output_tokens` | `stop_reason: "refusal"` or `"max_tokens"` can break the schema |
| TS helper | none needed (pass JSON Schema) | `zodTextFormat` + `responses.parse` | `zodOutputFormat` + `messages.parse` |

Sources: [Gemini structured output](https://ai.google.dev/gemini-api/docs/structured-output), [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [Anthropic structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

**Consequence:** the exercise and grade schemas in #7 should be flat objects with all fields required and no length constraints. That shape works on all three. Always parse the result with Zod on the server, and treat a refusal or truncated response as a retryable error.

## 4. Japanese generation and constrained vocabulary

- All three vendors claim multilingual support. Anthropic: all current models support "multilingual capabilities" ([models](https://platform.claude.com/docs/en/about-claude/models/overview)). None of the pages read publishes a JLPT-level or constrained-vocabulary benchmark.
- "Use only these words and kanji" is a soft instruction for every provider. No API can constrain tokens to a vocab list for free-form Japanese text. Schema enforcement covers only the JSON shape.
- **Implication:** the server should check constraint adherence in code, not trust the model. Checking kanji is cheap (compare each kanji character in the sentence against the known-kanji set). Checking vocabulary needs a Japanese tokenizer. On a violation, retry once or accept with a flag. This check also gives the #7 eval an objective metric for comparing models.
- The small models (`flash-lite`, `luna`, `haiku`) are the most likely to drift from the list. The eval should compare one small and one mid model per provider on the same 20–30 prompts before #7 locks a model.

## 5. Semantic grading suitability

- Grading English translations is an easier task than generation: short input, short output, judged against a reference meaning the model already produced.
- Consistency comes from settings, not from the provider. Use the lowest reasoning effort, a fixed rubric in the prompt (what loses points: wrong tense, missed particle meaning, omitted word), and a schema like `{ score: integer, pass: boolean, feedback: string }`. Compute `pass` on the server as `score >= 70` instead of trusting the model's boolean.
- OpenAI and Gemini can enforce `0 ≤ score ≤ 100` in the schema. With Anthropic, Zod catches out-of-range values after the response.

## 6. Latency and SDKs on Vercel serverless

| Package | Latest | Node engine | Source |
| --- | --- | --- | --- |
| `@google/genai` | 2.28.0 | >=20 | [npm](https://www.npmjs.com/package/@google/genai) |
| `openai` | 7.32.0 | >=22 | [npm](https://www.npmjs.com/package/openai) |
| `@anthropic-ai/sdk` | 0.133.0 | none declared | [npm](https://www.npmjs.com/package/@anthropic-ai/sdk) |
| `ai` (Vercel AI SDK) | 7.0.137 | >=22 | [npm](https://www.npmjs.com/package/ai) |
| `@ai-sdk/google` / `@ai-sdk/openai` / `@ai-sdk/anthropic` | 4.0.93 / 4.0.91 / 4.0.78 | >=22 | npm |
| `zod` | 4.6.5 | none declared | [npm](https://www.npmjs.com/package/zod) |

- All are actively maintained (each published within the last week) and run on Node 24, Vercel's default (see `docs/research/solidstart-vercel.md`).
- Vendors state latency only in relative terms: Haiku 5.5 is "Fastest" in Anthropic's lineup, `gemini-3.5-flash-lite` is the "fastest" 3.5 model, and `gpt-6-luna` is "most efficient". For a ~1k-token response, any of them finishes far inside the 300s Hobby function limit. **Do not stream:** the JSON payload is small, streaming holds the invocation open, and partial objects cannot be validated ([AI SDK structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)).
- Payload: the known-vocab list goes from the browser to the server function. ~2,000 items is well under 100 KB, far below the 4.5 MB cap.
- OpenAI notes that "the first request you make with any schema will have additional latency". Later requests with the same schema avoid it.

## 7. Provider-agnostic SDK: worth it?

**Yes, the Vercel AI SDK is worth it for this app, used without AI Gateway.**

- One call shape for every provider: `generateText({ model: google("gemini-3.5-flash-lite"), output: Output.object({ schema }), prompt })`. The result is Zod-validated, and a failure throws `AI_NoObjectGeneratedError` ([docs](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)).
- The fallback in this document and the cross-provider eval in #7 become a change of one import and one model string, instead of three integrations with different schema helpers.
- The Anthropic provider uses native `output_config.format` by default (`structuredOutputMode: "auto"`) ([AI SDK Anthropic provider](https://ai-sdk.dev/providers/ai-sdk-providers/anthropic)), so the abstraction does not downgrade to a weaker JSON mode there.
- Cost: two dependencies (`ai`, one `@ai-sdk/<provider>`) plus `zod`. Use a provider instance (`google(...)`), not a bare `"provider/model"` string. A bare string routes through AI Gateway and needs `AI_GATEWAY_API_KEY` or OIDC ([AI Gateway](https://vercel.com/docs/ai-gateway)).
- If the eval picks one provider and no fallback is wanted, the provider's own SDK is equally fine. The AI SDK is a convenience here, not a requirement.

## Recommendation

1. **SDK:** `ai@7` + `@ai-sdk/google` + `zod`; `generateText` + `Output.object`; non-streaming; key in a plain server-only env var (`GOOGLE_GENERATIVE_AI_API_KEY`).
2. **Model:** `gemini-3.5-flash-lite` on the free tier for both generation and grading, at the lowest thinking level. Move generation to `gemini-3.8-flash` if the #7 eval shows vocab/kanji violations.
3. **Fallback:** `gpt-6-luna` via `@ai-sdk/openai` at reasoning effort `none`, ~$1.30/month at the estimate above. It also enforces the score range in the schema. `claude-haiku-5-5` is an equal-cost alternative. Switch to the fallback if the free tier is not allowed (EEA rule), if the AI Studio limits are too low, or if Gemini fails the eval.
4. **Guardrails:** keep the in-app daily cap; also set a provider-side spend limit (OpenAI usage limit or Anthropic Console spend limit) as a monthly backstop.

## Open questions surfaced

- **Owner's region.** If the owner is in the EEA, Switzerland, or the UK, the Gemini terms allow only Paid Services for this app. Then the recommendation becomes the paid fallback.
- **Constraint check.** The server needs a kanji check (simple) and possibly a vocab check (needs a Japanese tokenizer that runs on Node serverless). This is a design point for #7 and possibly a new dependency.
- **Daily cap with no DB.** A stateless serverless function cannot count requests across invocations by itself. The cap needs some state (for example, a signed counter in the session cookie, which is per-browser only, or a small KV store). Provider-side spend limits are monthly, not daily.
- **Known-list size.** Input cost and latency scale with how much of the known-vocab list #6 sends per generation call.
