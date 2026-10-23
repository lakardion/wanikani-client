import { TokenizerBuilder, type Tokenizer } from 'lindera-wasm-ipadic-nodejs'
import { joinReading } from '~/lib/reading'

let tokenizer: Tokenizer | undefined

/** Hiragana reading of `text`, from IPADIC with the override table. */
export function reading(text: string) {
  if (!tokenizer) {
    const builder = new TokenizerBuilder()
    builder.setDictionary('embedded://ipadic')
    builder.setMode('normal')
    tokenizer = builder.build()
  }
  return joinReading(tokenizer.tokenize(text).map((t) => ({ surface: t.surface, reading: t.details[7] })))
}
