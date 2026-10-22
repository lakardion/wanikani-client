# OpenRouter free models for exercise generation and grading

Research for lakardion/wanikani-client#4. It follows `docs/research/llm-provider.md` (branch `research/llm-provider`), which chose `gemini-3.5-flash-lite` on Gemini Paid Services. The owner then decided to run the proof of concept on **OpenRouter free models** and move to a paid model later.

All facts come from first-party pages (openrouter.ai docs, terms, and public API), the npm registry, the published package source, and ai-sdk.dev. Read on **2026-10-13**. Prices are USD per 1M tokens.

## Bottom line

- **Free limits fit only with credits.** Free models allow 20 requests/minute. The daily cap is 50 requests with less than $10 of credits ever bought, and 1,000 with at least $10. The app makes about 50 calls/day, so with no credits it has no headroom for retries (§1).
- **Free endpoints differ in data policy.** OpenRouter itself does not store prompts by default. The provider behind each free endpoint has its own policy. Some free endpoints (NVIDIA, Liquid) may train on prompts, and you must turn on a separate free-model training setting to reach them (§2).
- **No EEA restriction found** in OpenRouter terms or docs. EU in-region routing exists, but only on Business and Enterprise plans (§2).
- **Use `@openrouter/ai-sdk-provider@3.1.0`** (peer `ai@^7`). `Output.object` maps to `response_format: { type: "json_schema", strict: true }` (§3).
- **Few free models enforce a JSON Schema.** Only 5 free entries list `structured_outputs`. The free list changes every few weeks (§4).
- **A per-key credit limit with a daily, weekly, or monthly reset** is a good cost guardrail for the paid step. It also gives the daily spend cap that the earlier research could not do without a database (§5).
- **Recommendation:** buy $10 of credits once. Eval `google/gemma-4-31b-it:free` and `nvidia/nemotron-3-super-120b-a12b:free`. Fall back to the paid `google/gemma-4-31b-it` (~$0.09/$0.34) or `google/gemini-3.5-flash-lite` ($0.30/$2.50) through the same key.

---

## 1. Free-model rate limits

From [Limits](https://openrouter.ai/docs/api/reference/limits) (constants in the page source: `FREE_MODEL_RATE_LIMIT_RPM = 20`, `FREE_MODEL_NO_CREDITS_RPD = 50`, `FREE_MODEL_HAS_CREDITS_RPD = 1000`, `FREE_MODEL_CREDITS_THRESHOLD = 10`):

| Credits purchased (all time) | Requests per minute | Requests per day |
| --- | --- | --- |
| Less than 10 | 20 | 50 |
| At least 10 | 20 | 1000 |

- The limits apply to model IDs that end in `:free`. The tier depends on **all-time credits purchased**, not on the current balance. "The higher daily ceiling is granted starting one credit below the table's threshold" (at $9) to absorb fees.
- The paid variant of a model "has no platform-level request cap".
- `GET https://openrouter.ai/api/v1/key` returns `free_model_daily_requests` (daily counter and ceiling). It does not report the per-minute limit.
- A 429 comes either from OpenRouter (free-model RPM/RPD, DDoS protection) or from the upstream provider. OpenRouter 429s carry `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.
- "If your account has a negative credit balance, you may see 402 errors, including for free models."
- Credit fees: Stripe "5.5% ($0.80 minimum)", crypto 5%. "There is no markup on inference pricing." OpenRouter "reserves the right to expire unused credits after one year" ([FAQ](https://openrouter.ai/docs/faq); [Terms §4.2](https://openrouter.ai/terms): "365 days after purchase").
- The FAQ also says free models "are usually not suitable for production use".

**Consequence:** at ~50 calls/day, the 50 RPD cap with no credits is the same as the planned volume. One failed parse and retry, or one eval run, uses it up. A one-time $10 purchase (about $10.55 with the Stripe fee) raises the cap to 1,000/day and stays in the account to pay for the later paid step.

## 2. Data policy for free endpoints

**OpenRouter itself** ([Data Collection](https://openrouter.ai/docs/guides/privacy/data-collection)):

- "Any prompt retention on OpenRouter is always opt-in." Private input/output logging and "OpenRouter Use of Inputs/Outputs" (1% discount) are both "Off by default".
- OpenRouter "samples a small number of prompts for categorization". If you did not opt in, the results are "stored completely anonymously". The categorization model has a zero-data-retention policy.
- OpenRouter stores request metadata (token counts, latency), not content.

**The provider behind each endpoint** ([Provider Logging](https://openrouter.ai/docs/guides/privacy/provider-logging)):

- Each endpoint has structured data-policy metadata. "On your account settings page, you can set whether you would like to allow routing to providers that may train on your data ... There are separate settings for paid and free models."
- "If you opt out of training in your account settings, OpenRouter will not route to providers that train." Endpoints with an unclear policy are treated as retaining and training ([ZDR](https://openrouter.ai/docs/guides/features/zdr)).
- If no provider meets the account's privacy settings, "you will get an error and your request will not complete" ([FAQ](https://openrouter.ai/docs/faq)).
- Per request: `provider.data_collection: "deny"` ("use only providers which do not collect user data") and `provider.zdr: true`. An account-wide "ZDR Only" toggle exists per model group ([Provider selection](https://openrouter.ai/docs/guides/routing/provider-selection), [ZDR](https://openrouter.ai/docs/guides/features/zdr)).
- [Terms §6.1](https://openrouter.ai/terms): "Some Models may store and train on Inputs". §16 disclaims any warranty about provider data handling.

**Data policy of the providers behind the candidate free endpoints**, from `https://openrouter.ai/api/frontend/v1/all-providers` (the data source of the Provider Logging table):

| Free endpoint | Provider | Trains on prompts | Retains prompts |
| --- | --- | --- | --- |
| `nvidia/nemotron-3-super-120b-a12b:free` | NVIDIA | **yes** | yes |
| `liquid/lfm-2.5-2.6b:free` | Liquid | **yes** | yes |
| `google/gemma-4-31b-it:free`, `google/gemma-4-26b-a4b-it:free` | Google AI Studio | no | yes, 55 days |
| `dots-studio/dots-3-note-preview:free` | AtlasCloud | no | yes |
| `apodex/apodex-1.1-mini:free` | Novita | no | no |

The inputs here are a vocab/kanji list and the owner's own English translations. They are not sensitive, so a training endpoint is acceptable for the proof of concept. To reach NVIDIA or Liquid free endpoints, turn on the **free-model** training setting at [settings/privacy](https://openrouter.ai/settings/privacy). Keep the paid-model setting off.

**EEA:** the OpenRouter Terms and the docs read do not mention the EEA, the EU, the UK, or GDPR, other than a DPA for organizational users (§10.2). They have no rule like the Gemini API rule ("only Paid Services ... in the European Economic Area"). Terms §5.7 says some providers do not allow users in certain regions, and the user must not avoid that with a VPN. EU in-region routing (`https://eu.openrouter.ai`) exists "on the Business and Enterprise plans" only.

## 3. AI SDK connection

| Package | Latest | Peer deps | Node engine | Source |
| --- | --- | --- | --- | --- |
| `@openrouter/ai-sdk-provider` | 3.1.0 | `ai@^7.0.0`, `zod@^3.25.76 \|\| ^4.1.8` | >=22 | [npm](https://www.npmjs.com/package/@openrouter/ai-sdk-provider) |
| `ai` | 7.0.138 | | | [npm](https://www.npmjs.com/package/ai) |
| `@ai-sdk/openai-compatible` | 3.0.68 | `zod` | | [npm](https://www.npmjs.com/package/@ai-sdk/openai-compatible) |

- Both the [OpenRouter docs](https://openrouter.ai/docs/guides/community/vercel-ai-sdk) and the [AI SDK provider list](https://ai-sdk.dev/providers/community-providers/openrouter) point to `@openrouter/ai-sdk-provider` (repo `OpenRouterTeam/ai-sdk-provider`). Use it, not the generic OpenAI-compatible provider. It types OpenRouter-only settings: `provider` routing (`require_parameters`, `data_collection`, `zdr`), `plugins`, `reasoning`, `usage`, `extraBody`.
- **Structured output works.** In the published `dist/index.js` (3.1.0), an AI SDK `responseFormat` of type `json` with a schema becomes `response_format: { type: "json_schema", json_schema: { schema, strict: true, name: "response" } }`. `strict` defaults to `true`. `Output.object({ schema })` sends a JSON schema, so it takes this path. The AI SDK then validates with Zod and throws `AI_NoObjectGeneratedError` on a parse or schema failure ([AI SDK structured data](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)).
- OpenRouter [structured outputs](https://openrouter.ai/docs/guides/features/structured-outputs): "Support is determined per endpoint, not just per model", and "exact compliance is not guaranteed on every endpoint". Some providers treat the schema "as a strong hint". To route only to endpoints that support it, set `provider: { require_parameters: true }`.
- When `require_parameters` is off, `response_format` is a soft preference. "If none of them support it, the request is still routed to that model and the parameter is ignored" ([Provider selection](https://openrouter.ai/docs/guides/routing/provider-selection)). The structured-outputs page says instead that an unsupported model fails with an error. The pages disagree, so always rely on the Zod validation.
- The [Response Healing plugin](https://openrouter.ai/docs/guides/features/plugins/response-healing) (`plugins: [{ id: "response-healing" }]`) repairs malformed JSON for non-streaming `json_schema` requests. It fits this app's non-streaming calls.
- Shape:

  ```ts
  import { createOpenRouter } from "@openrouter/ai-sdk-provider";
  const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY });
  const model = openrouter("google/gemma-4-31b-it:free", {
    provider: { require_parameters: true },
    plugins: [{ id: "response-healing" }],
  });
  /** generateText({ model, output: Output.object({ schema }), prompt }) */
  ```

## 4. Free models today

From `GET https://openrouter.ai/api/v1/models` and `/api/v1/models/{id}/endpoints`, 2026-10-13. 17 zero-price text entries. Not listed: coding/agent models without `response_format`, the content-safety model, and two Lyria music models.

**Free entries with `structured_outputs` (JSON Schema):**

| Model ID | Notes | Context |
| --- | --- | --- |
| `nvidia/nemotron-3-super-120b-a12b:free` | 120B MoE, 12B active. The [model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16) lists Japanese as a supported language and names "structured outputs" in fine-tuning. Provider NVIDIA trains on prompts. | 262k |
| `apodex/apodex-1.1-mini:free` | "Reasoning-first", built for "research and forecasting tasks". Added 2026-10-01. No language data found. | 262k |
| `dots-studio/dots-3-note-preview:free` | Preview, 280B MoE, 16B active. **`expiration_date` 2026-12-31.** | 512k |
| `liquid/lfm-2.5-2.6b:free` | 2.6B parameters. Too small for this task. Provider trains on prompts. | 65k |
| `openrouter/free` | Router: picks a free model "at random" that supports the request's features. Not reproducible, so not usable for an eval. | 200k |

**Free entries with `response_format` but not `structured_outputs` (JSON mode only):**

| Model ID | Notes |
| --- | --- |
| `google/gemma-4-31b-it:free` | 30.7B dense. The [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4) says "Out-of-the-box support for 35+ languages, pre-trained on 140+ languages". It does not name Japanese. Free provider: Google AI Studio. Of its 13 paid endpoints, 11 support `structured_outputs`. The lowest price is $0.09 input / $0.34 output. |
| `google/gemma-4-26b-a4b-it:free` | 25.2B MoE, 3.8B active. Faster, likely weaker. |

**Churn:** "Free model availability changes frequently" ([Free Models Router](https://openrouter.ai/docs/guides/routing/routers/free-router)). Of the 17 zero-price text entries, 9 were added after 2026-07-01. Two (`poolside/laguna-*-2.1:free`) expire on 2026-10-31, and `dots-3-note-preview:free` expires on 2026-12-31. The examples in OpenRouter's own docs (DeepSeek R1, Llama, Qwen free) are no longer in the list. Plan for the chosen free model to disappear within months. Keep the model ID in one env var.

**Plausible for Japanese generation and grading:** `nemotron-3-super-120b-a12b:free` (Japanese named, schema enforced) and `gemma-4-31b-it:free` (Google multilingual model, JSON mode only on the free endpoint). The others are either too small, previews that expire, or tuned for other tasks. No vendor publishes a constrained-vocabulary Japanese benchmark, so the #7 eval decides.

## 5. Spend cap for the paid step

From [Limits](https://openrouter.ai/docs/api/reference/limits) and [Capping shared agent keys](https://openrouter.ai/docs/guides/best-practices/capping-shared-agent-keys):

- **Per-key credit limit:** `limit` (USD), `limit_reset` = `daily`, `weekly`, or `monthly` ("a rolling allowance that resets at midnight UTC"), or unset for a lifetime cap. When it is used up, requests fail with **402** and `error.metadata.limit_source: "openrouter_key_limit"`. `GET /api/v1/key` returns `limit_remaining`, `usage_daily`, `usage_weekly`, `usage_monthly`.
- **Prepaid balance:** credits are prepaid. With auto top-up off, the balance is a hard ceiling.
- **Guardrails** add USD budgets with daily/weekly/monthly reset, model and provider allowlists, and ZDR enforcement for org members and keys ([Guardrails](https://openrouter.ai/docs/guides/features/guardrails)). Workspace budgets are an Enterprise feature. A per-key limit is enough for one user.

**Consequence:** a key limit of, for example, $0.50 with `limit_reset: "daily"` gives a provider-side **daily** spend cap. The earlier research noted that a daily cap with no database was hard. This solves it for money, not for request count. The key limit does not limit free-model requests, which cost $0.

## Recommendation

1. **Account:** buy $10 of credits once, before the eval. This lifts free RPD from 50 to 1,000 and funds the paid step. Leave auto top-up off.
2. **Privacy settings:** keep OpenRouter logging and "Use of Inputs/Outputs" off (the defaults). Turn on free-model training only if you eval Nemotron.
3. **SDK:** `ai@7` + `@openrouter/ai-sdk-provider@3.1.0` + `zod`. `generateText` + `Output.object`, non-streaming. Set `provider: { require_parameters: true }` and the `response-healing` plugin. Key in a server-only `OPENROUTER_API_KEY`. Model ID in an env var.
4. **Eval (#7):** `google/gemma-4-31b-it:free` and `nvidia/nemotron-3-super-120b-a12b:free` on the same 20–30 prompts. Note: Gemma's free endpoint has JSON mode only, so drop `require_parameters` for it or its request has no eligible endpoint, and rely on Zod.
5. **Fallback (paid, same key):** first `google/gemma-4-31b-it` (11 of 13 paid endpoints enforce the schema, so keep `require_parameters: true`; ~$0.09/$0.34). If quality is low, `google/gemini-3.5-flash-lite` ($0.30/$2.50 on OpenRouter, the model from the earlier research). Set a daily key credit limit before you switch.

## Open questions surfaced

- **Gemma free endpoint and `require_parameters`.** With `require_parameters: true` and a `json_schema` request, the free Gemma endpoint may be excluded and the call may fail with no endpoint. Test this first.
- **Paid Gemini through OpenRouter and the EEA.** OpenRouter has no EEA rule. Whether Google's Gemini API terms reach a call made through OpenRouter's account is not stated in the pages read.
- **Model churn.** A free model can vanish between eval and use. The fallback chain above covers this.
