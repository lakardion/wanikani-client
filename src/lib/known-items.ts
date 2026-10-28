import type { SubjectEnvelope, WanikaniClient } from "wanikani-sdk";

export const KNOWN_MIN_SRS_STAGE = 5;
export const MIN_KNOWN_WORDS = 30;

const STORAGE_KEY = "wanikani.knownItems";
const TYPES = ["kanji", "vocabulary", "kana_vocabulary"] as const;
const ID_CHUNK_SIZE = 200;
const WATERMARK_SKEW_MS = 10 * 60 * 1000;

export type KnownItem = {
  type: (typeof TYPES)[number];
  characters: string;
  meaning: string;
  partsOfSpeech: string[];
};

export type KnownItems = { watermark: string; items: { [subjectId: string]: KnownItem } };

export type Progress = { done: number; total: number };

export function loadKnownItems(): KnownItems | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as KnownItems) : null;
  } catch {
    return null;
  }
}

export function saveKnownItems(value: KnownItems): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function clearKnownItems(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function countKnown(value: KnownItems | null) {
  let words = 0;
  let kanji = 0;
  for (const item of Object.values(value?.items ?? {})) {
    if (item.type === "kanji") kanji++;
    else words++;
  }
  return { words, kanji };
}

function isKnownType(type: string): type is KnownItem["type"] {
  return (TYPES as readonly string[]).includes(type);
}

function toItem(subject: SubjectEnvelope): KnownItem | null {
  const data = subject.data;
  if (!isKnownType(subject.object) || data.hidden_at || !data.characters) return null;
  return {
    type: subject.object,
    characters: data.characters,
    meaning: data.meanings.find((m) => m.primary)?.meaning ?? data.meanings[0]?.meaning ?? "",
    partsOfSpeech: "parts_of_speech" in data ? (data.parts_of_speech as string[]) : [],
  };
}

/** Fetches subjects by id in parallel chunks and adds the visible ones to `items`. */
async function addSubjects(
  client: WanikaniClient,
  ids: number[],
  items: KnownItems["items"],
  onProgress?: (p: Progress) => void,
) {
  let done = 0;
  onProgress?.({ done, total: ids.length });
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += ID_CHUNK_SIZE) chunks.push(ids.slice(i, i + ID_CHUNK_SIZE));
  await Promise.all(
    chunks.map(async (chunk) => {
      const page = await client.subjects.list({ ids: chunk });
      for (const subject of page.data) {
        const item = toItem(subject);
        if (item) items[subject.id] = item;
      }
      done += chunk.length;
      onProgress?.({ done, total: ids.length });
    }),
  );
}

/**
 * First run when `stored` is null: every assignment at stage 5+.
 * Later runs: assignments changed since the watermark, any stage, so drops below stage 5 are removed.
 */
export async function syncKnownItems(
  client: WanikaniClient,
  stored: KnownItems | null,
  onProgress?: (p: Progress) => void,
): Promise<KnownItems> {
  const watermark = new Date(Date.now() - WATERMARK_SKEW_MS).toISOString();
  const items = { ...stored?.items };
  const missing: number[] = [];
  const input = stored
    ? { updated_after: stored.watermark }
    : { srs_stages: [5, 6, 7, 8, 9], subject_types: [...TYPES], hidden: false };
  for await (const page of client.assignments.paginate(input)) {
    for (const { data } of page.data) {
      if (!isKnownType(data.subject_type)) continue;
      if (data.srs_stage >= KNOWN_MIN_SRS_STAGE && !data.hidden) {
        if (!items[data.subject_id]) missing.push(data.subject_id);
      } else {
        delete items[data.subject_id];
      }
    }
  }
  await addSubjects(client, missing, items, onProgress);
  return { watermark, items };
}
