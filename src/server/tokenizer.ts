import { TokenizerBuilder, type Tokenizer } from "lindera-wasm-ipadic-nodejs";
import { furigana } from "~/lib/reading";

let tokenizer: Tokenizer | undefined;

/** Furigana of `text`, from IPADIC with the override table. */
export function rubySegments(text: string) {
  if (!tokenizer) {
    const builder = new TokenizerBuilder();
    builder.setDictionary("embedded://ipadic");
    builder.setMode("normal");
    tokenizer = builder.build();
  }
  return furigana(
    tokenizer.tokenize(text).map((t) => ({ surface: t.surface, reading: t.details[7] })),
  );
}
