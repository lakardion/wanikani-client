# Wanikani Client

A personal practice app that generates Japanese exercises from what the user has already learned on WaniKani.

## Language

**Known item**:
A WaniKani subject whose assignment is at SRS stage Guru or higher (Guru, Master, Enlightened, Burned). Hidden subjects never count.
_Avoid_: learned item, studied item

**Known word**:
A **Known item** of type vocabulary or kana vocabulary.
_Avoid_: known vocab, known noun

**Known kanji**:
A **Known item** of type kanji. Only these kanji may appear in a generated sentence.

**Word sample**:
The subset of **Known words** sent with one exercise request, spread evenly across **Word groups**.

**Word group**:
A coarse part-of-speech class of a **Known word**: noun, verb, adjective, adverb, or other. Subtypes (godan/ichidan verb, い/な adjective) do not split a group.
_Avoid_: part of speech (too fine-grained)

## Relationships

- A **Word sample** is drawn from the **Known words**; the **Known kanji** go with it in full.
- Radicals are never **Known items**: they are not words and do not appear in sentences.

## Flagged ambiguities

- "Known" alone is ambiguous between **Known word** and **Known kanji**: say which.
