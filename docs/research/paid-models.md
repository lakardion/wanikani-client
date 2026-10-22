# Cheapest paid OpenRouter models for exercise generation and grading

Research for lakardion/wanikani-client#27. It follows `docs/research/openrouter-free.md`. The free model `nvidia/nemotron-3.5-super-vl:free` is too slow (27–355 s per call, about 95% reasoning tokens, Vercel limit 300 s). This file gives a ranked shortlist of paid models for the eval in #28.

All facts come from first-party sources: the public OpenRouter API (`/api/v1/models`, `/api/v1/models/{id}/endpoints`, `/api/frontend/v1/all-providers`, `/api/frontend/v1/catalog/models`), the OpenRouter docs, the published `@openrouter/ai-sdk-provider@3.1.0` types, and vendor model cards and docs. Read on **2026-10-22**. Prices are USD per 1M tokens (input/output). The API returned 468 models.

## Bottom line

- **Shortlist, in eval order:** `openai/gpt-6-luna`, `anthropic/claude-haiku-5.5`, `deepseek/deepseek-v4-flash`, `mistralai/mistral-small-2603`, `google/gemini-3.1-flash-lite`. Reference row: `google/gemini-3.5-flash-lite`.
- **All five cost less than the reference.** One generation costs $0.00022–$0.00090, against $0.00129 for `gemini-3.5-flash-lite` (§2).
- **All five can turn reasoning off through OpenRouter** with `reasoning: { effort: "none" }`, or have it off by default. Reasoning made the free model slow. Turn it off in the eval, or most of these models reason at `medium` or `high` by default (§3).
- **The eval script cannot do this today.** `prompts.ts` calls `openrouter(model)` with no settings. #28 must pass `reasoning` and `provider` per model (§6).
- **OpenRouter does not publish speed stats in its public API.** `latency_last_30m` and `throughput_last_30m` are `null` on every endpoint of the 32 models read. The eval must measure speed (§4).
- **Routing can cost more than the list price.** The measured `gemma-4-31b-it` call cost $0.0016, about 3x its list price. The default router load-balances across endpoints, and some endpoints charge up to $0.75/$1.00. Set `provider.sort: "price"` or `max_price`, and log the cost per call (§6).
- **Drop Llama.** The Llama 4 model card does not list Japanese as a supported language (§5).

---

## 1. Method

- Started from all paid text models in `GET /api/v1/models`, sorted by the cost of one generation call.
- Kept models from the families in the ticket (DeepSeek, Qwen, Mistral, Llama, small OpenAI, small Google) and other models with a low price and `structured_outputs`.
- For 32 candidates, read `/api/v1/models/{id}/endpoints` for each endpoint's price, `supported_parameters`, quantization, and uptime.
- Read the per-model `reasoning` object in `/api/v1/models` (`mandatory`, `default_enabled`, `supported_efforts`, `default_effort`), as the [reasoning tokens doc](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens) describes.
- Read the provider data policy from `/api/frontend/v1/all-providers`, the data source of the [Provider Logging](https://openrouter.ai/docs/guides/privacy/provider-logging) table.

Call sizes come from the ticket: generation about 1,800 input and 300 output tokens, grading about 300 input and 60 output tokens. Note: `prototypes/exercise-prompts/out/report-anchors.md` shows about 2,100 input tokens per generation. Real cost is about 10–15% higher than the numbers below.

## 2. Price per call

List price is the price on `/api/v1/models`. It is the price of the main endpoint, not always the cheapest one.

| Model | List price (in/out) | Generation call | Grading call | vs reference |
| --- | --- | --- | --- | --- |
| `deepseek/deepseek-v4-flash` | 0.091 / 0.182 | $0.00022 | $0.000038 | 0.17x |
| `openai/gpt-6-luna` | 0.10 / 0.50 | $0.00033 | $0.000060 | 0.26x |
| `anthropic/claude-haiku-5.5` | 0.10 / 0.50 | $0.00033 | $0.000060 | 0.26x |
| `mistralai/mistral-small-2603` | 0.15 / 0.60 | $0.00045 | $0.000081 | 0.35x |
| `google/gemini-3.1-flash-lite` | 0.25 / 1.50 | $0.00090 | $0.000165 | 0.70x |
| `google/gemini-3.5-flash-lite` (reference) | 0.30 / 2.50 | $0.00129 | $0.000240 | 1.00x |
| `google/gemma-4-31b-it` (baseline) | 0.20 / 0.40 | $0.00048 | $0.000084 | 0.37x |

Other models read, not shortlisted (§7): `mistralai/mistral-small-3.2-24b-instruct` $0.00024, `google/gemini-2.5-flash-lite` $0.00030, `openai/gpt-4.1-nano` $0.00030, `qwen/qwen3-235b-a22b-2507` $0.00033, `qwen/qwen3.8-flash` $0.00041, `openai/gpt-4o-mini` $0.00045, `meta-llama/llama-4-maverick` $0.00053, `deepseek/deepseek-v4.1-flash` $0.00090. Reasoning-only models: `z-ai/glm-5.3-flash` $0.00007, `openai/gpt-5-nano` $0.00021.

**Consequence:** at about 50 calls a day, every shortlisted model costs less than $0.05 a day. Price does not decide between them. Quality and speed decide.

Reasoning tokens are billed as output tokens ([reasoning tokens](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens)). With reasoning on, a call can cost 5–10x the numbers above.

## 3. Structured output and reasoning control

`json_schema` column: endpoints that list `structured_outputs`, of all endpoints. With `provider: { require_parameters: true }`, OpenRouter routes only to those ([Provider selection](https://openrouter.ai/docs/guides/routing/provider-selection)).

| Model | `json_schema` endpoints | Reasoning by default | Can turn off | Cap |
| --- | --- | --- | --- | --- |
| `openai/gpt-6-luna` | 7 of 7 | yes, `medium` | yes, `effort: "none"` | effort levels only |
| `anthropic/claude-haiku-5.5` | 6 of 10 (no Bedrock, no Claude Platform on AWS) | adaptive, default effort `medium` | yes, `effort: "none"` | effort levels only |
| `deepseek/deepseek-v4-flash` | 11 of 15 | `default_effort: "high"` | yes, `effort: "none"` ("Non-Think" mode) | effort levels only |
| `mistralai/mistral-small-2603` | 4 of 4 (all Mistral) | **no** (`default_enabled: false`) | already off | `high` or `none` only |
| `google/gemini-3.1-flash-lite` | 8 of 8 | yes, `minimal` | yes, `effort: "none"` | effort levels |
| `google/gemini-3.5-flash-lite` (reference) | 8 of 8 | yes, `minimal`, **mandatory** | no | `minimal` is the lowest |
| `google/gemma-4-31b-it` (baseline) | 13 of 15 | no (`default_enabled: false`) | already off | no effort control |
| `qwen/qwen3.8-flash` | 2 of 2 (Alibaba only) | yes | no `none` effort listed | `reasoning.max_tokens` |
| `z-ai/glm-5.3-flash` | 29 of 35 | yes, `max`, **mandatory** | no | `low` |
| `openai/gpt-5-nano` | 4 of 4 | yes, **mandatory** | no | `minimal` |

Sources: `reasoning` object in `/api/v1/models`, `supported_parameters` per endpoint. Anthropic lists Haiku 5.5 thinking as "Adaptive" with default effort `medium` ([models overview](https://platform.claude.com/docs/en/about-claude/models/overview)). The DeepSeek V4 Flash card names a "Non-Think" mode: "Fast, intuitive responses" ([model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)). The Mistral Small 4 card says `reasoning_effort: "none"` means "Do not use reasoning" ([model card](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603)).

- Effort `"none"` "disables reasoning entirely". When a model marks reasoning as `mandatory`, it rejects `"none"` ([reasoning tokens](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens)).
- `gemini-3.5-flash-lite` reasons at `minimal` and cannot go lower. It still measured 3 s, so `minimal` is small enough.

## 4. Speed

- `/api/v1/models/{id}/endpoints` has `latency_last_30m` and `throughput_last_30m` fields. All were `null` for the 32 models read. The model `/performance` pages load their charts on the client, from no public JSON route found in the page bundles.
- Vendor labels only: Anthropic rates Haiku 5.5 latency "Fastest" in its lineup. OpenRouter describes GPT-6 Luna as "suited for high-volume and latency-sensitive workloads". DeepSeek V4 Flash is a MoE with 13B active parameters. Mistral Small 4 is a MoE with 6.5B active parameters.
- Measured baselines (from #27): `gemma-4-31b-it` 4 s, `gemini-3.5-flash-lite` 3 s, both with no or minimal reasoning. A model with reasoning off and 300 output tokens should land in the same range. The eval must confirm this.
- OpenRouter can route by speed: `provider.sort: "latency"` or `"throughput"`, or `preferred_max_latency` / `preferred_min_throughput` thresholds ([Provider selection](https://openrouter.ai/docs/guides/routing/provider-selection)).

## 5. Japanese quality

No vendor publishes a JLPT-level or constrained-vocabulary benchmark. The table gives the best published evidence for each model.

| Model | Published evidence |
| --- | --- |
| `openai/gpt-6-luna` | General claim only: OpenAI models support "multilingual capabilities" ([models](https://developers.openai.com/api/docs/models)). No Japanese score found for Luna. |
| `anthropic/claude-haiku-5.5` | Predecessor Haiku 4.5 scores **93.5%** of its English result in Japanese on human-translated MMLU ([multilingual support](https://platform.claude.com/docs/en/build-with-claude/multilingual-support)). Haiku 5.5 is not in that table. |
| `deepseek/deepseek-v4-flash` | Base model MMMLU (multilingual MMLU) 88.8 ([model card](https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash)). The card does not mention Japanese. Strong in Chinese (C-Eval 92.1), which helps with kanji. |
| `mistralai/mistral-small-2603` | Card lists Japanese among supported languages ("Chinese, Japanese, Korean, and Arabic") ([model card](https://huggingface.co/mistralai/Mistral-Small-4-119B-2603)). |
| `google/gemini-3.1-flash-lite` | Same family as the reference, which had 0 of 3 kanji-check failures. No Japanese score found. |
| `qwen/qwen3.8-flash` | Qwen3 family claims 119 languages, Japanese named ([Qwen3 blog](https://qwenlm.github.io/blog/qwen3/)). No language list for 3.8 Flash. |
| `meta-llama/llama-4-*` | **Japanese not supported.** The 12 supported languages are "Arabic, English, French, German, Hindi, Indonesian, Italian, Portuguese, Spanish, Tagalog, Thai, and Vietnamese" ([model card](https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct)). |
| `google/gemma-4-31b-it` | Card does not name Japanese (see `openrouter-free.md`). Measured: 1 of 3 kanji-check failures, weak sentences ("drink breakfast"). |

**Consequence:** the published evidence cannot rank these models for this task. The #28 eval decides. It already measures kanji-check failures and grading bands.

## 6. Eval setup that the shortlist needs

The `@openrouter/ai-sdk-provider@3.1.0` model settings accept `reasoning` (`enabled`, `exclude`, `effort` incl. `"none"`, or `max_tokens`), `provider` (`order`, `only`, `ignore`, `sort`, `require_parameters`, `data_collection`, `max_price`), `usage`, and `extraBody` (`dist/index.d.ts`). `prompts.ts` uses none of them today.

- **Reasoning:** pass `reasoning: { effort: "none" }` for `gpt-6-luna`, `claude-haiku-5.5`, `deepseek-v4-flash`, and `gemini-3.1-flash-lite`. Pass nothing for `mistral-small-2603` (off by default). Do not pass `"none"` to `gemini-3.5-flash-lite`; its reasoning is mandatory.
- **Routing:** pass `provider: { require_parameters: true, sort: "price" }`. `sort` turns off load balancing and tries the cheapest endpoint first.
- **Cost:** the measured Gemma call ($0.0016) is about 3x the list-price estimate. Gemma has reasoning off by default, so the likely cause is routing to a pricier endpoint (Gemma endpoints range from $0.10/$0.34 to $0.75/$1.00). This is not verified. Log the actual cost and provider per call (`usage: { include: true }` and the response's provider metadata).
- **Quantization:** DeepSeek V4 Flash endpoints run at fp8, fp4, or mxfp4. Quality can differ per endpoint. If results vary, pin one provider with `provider.only` (for example `deepinfra` or `parasail`, both fp8, no retention).
- `OPENROUTER_MODELS` holds IDs only. Per-model settings need a small map in the eval, keyed by model ID.

## 7. Data use

From `/api/frontend/v1/all-providers`. No endpoint of a shortlisted model trains on prompts.

| Model | Endpoints that retain prompts | Endpoints that keep nothing |
| --- | --- | --- |
| `openai/gpt-6-luna` | OpenAI (up to 30 days) | Azure, Amazon Bedrock |
| `anthropic/claude-haiku-5.5` | Anthropic (30 days) | Google Vertex, Azure, Amazon Bedrock |
| `deepseek/deepseek-v4-flash` | StreamLake, Baidu, AtlasCloud, GMICloud | DeepInfra, Parasail, Venice, DigitalOcean, Relace, Wafer, others |
| `mistralai/mistral-small-2603` | Mistral (30 days) | `mistral/zdr` endpoint |
| `google/gemini-3.1-flash-lite` | Google AI Studio (55 days) | Google Vertex |

- The DeepSeek first-party provider **trains on prompts**. It does not serve `deepseek-v4-flash`, but it serves `deepseek-v4.1-flash-1017`. Keep the paid-model training setting off.
- The inputs are a vocab list and the owner's own translations. Retention is acceptable. `provider.zdr: true` removes retaining endpoints if needed.

## Ranked shortlist

| Rank | Model ID | Generation call | `json_schema` | Reasoning control | Speed | Why |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `openai/gpt-6-luna` | $0.00033 | 7 of 7 | default `medium`, `"none"` allowed | not published; "latency-sensitive" tier | Newest small OpenAI model, every endpoint enforces the schema, 4x cheaper than the reference. |
| 2 | `anthropic/claude-haiku-5.5` | $0.00033 | 6 of 10 | adaptive `medium`, `"none"` allowed | not published; "Fastest" in Anthropic lineup | Only candidate with a published Japanese score (predecessor 93.5% of English). |
| 3 | `deepseek/deepseek-v4-flash` | $0.00022 | 11 of 15 | default `high`, `"none"` allowed | not published; 13B active MoE | Cheapest candidate with schema support and a Non-Think mode; strong Chinese helps kanji. |
| 4 | `mistralai/mistral-small-2603` | $0.00045 | 4 of 4 | off by default | not published; 6.5B active MoE | Japanese named on the card, no reasoning by default, ZDR endpoint. |
| 5 | `google/gemini-3.1-flash-lite` | $0.00090 | 8 of 8 | default `minimal`, `"none"` allowed | not published | Same family as the reference at 30% less; safe fallback. |
| ref | `google/gemini-3.5-flash-lite` | $0.00129 | 8 of 8 | `minimal`, mandatory | measured 3 s | Measured 0 of 3 kanji-check failures. |

**Not shortlisted:**

- `meta-llama/llama-4-scout`, `llama-4-maverick`, `llama-3.3-70b-instruct`: Japanese is not a supported language.
- `google/gemma-4-31b-it`: measured weak sentences and 1 of 3 kanji failures. `gemma-4-26b-a4b-it` is the smaller sibling (3.8B active), so expect no better.
- `qwen/qwen3.8-flash`: reasoning on by default with no `"none"` effort listed, and only Alibaba endpoints. Add it if a sixth slot is wanted, with `reasoning.max_tokens` set low.
- `z-ai/glm-5.3-flash`, `openai/gpt-5-nano`, `openai/gpt-oss-120b`: reasoning is mandatory. That is the cause of the free model's slowness.
- `openai/gpt-4.1-nano`, `openai/gpt-4o-mini`, `google/gemini-2.5-flash-lite`, `mistralai/mistral-small-3.2-24b-instruct`: cheap and no reasoning, but older models. Use them as a fallback if all five fail on quality.

## Open questions surfaced

- **Speed numbers.** OpenRouter's public API gives no latency or throughput. The #28 eval is the only source.
- **Gemma cost gap.** The 3x gap to list price is likely routing. Confirm it from the logged provider and cost in #28.
- **Haiku 5.5 Japanese score.** Anthropic publishes the multilingual table for Haiku 4.5 only.
