import type { WanikaniClient } from "wanikani-sdk";

export type ParamDef =
  | { kind: "id"; name: "id" }
  | { kind: "numberArray"; name: string }
  | { kind: "stringArray"; name: string }
  | { kind: "enumArray"; name: string; options: readonly string[] }
  | { kind: "boolean"; name: string }
  | { kind: "datetime"; name: string }
  | { kind: "number"; name: string };

export type MethodEntry = {
  id: string;
  namespace: string;
  method: "get" | "list";
  label: string;
  params: ParamDef[];
  invoke: (client: WanikaniClient, args: Record<string, unknown>) => Promise<unknown>;
};

const SUBJECT_TYPES = ["radical", "kanji", "vocabulary", "kana_vocabulary"] as const;

const idOnly: ParamDef[] = [{ kind: "id", name: "id" }];

const pagination: ParamDef[] = [
  { kind: "number", name: "page_after_id" },
  { kind: "number", name: "page_before_id" },
];

export const METHODS: MethodEntry[] = [
  {
    id: "user.get",
    namespace: "user",
    method: "get",
    label: "user.get()",
    params: [],
    invoke: (c) => c.user.get(),
  },
  {
    id: "summary.get",
    namespace: "summary",
    method: "get",
    label: "summary.get()",
    params: [],
    invoke: (c) => c.summary.get(),
  },

  {
    id: "subjects.get",
    namespace: "subjects",
    method: "get",
    label: "subjects.get(id)",
    params: idOnly,
    invoke: (c, a) => c.subjects.get(a.id as number),
  },
  {
    id: "subjects.list",
    namespace: "subjects",
    method: "list",
    label: "subjects.list(filter)",
    params: [
      { kind: "numberArray", name: "ids" },
      { kind: "enumArray", name: "types", options: SUBJECT_TYPES },
      { kind: "stringArray", name: "slugs" },
      { kind: "numberArray", name: "levels" },
      { kind: "boolean", name: "hidden" },
      { kind: "datetime", name: "updated_after" },
      ...pagination,
    ],
    invoke: (c, a) => c.subjects.list(a),
  },

  {
    id: "assignments.get",
    namespace: "assignments",
    method: "get",
    label: "assignments.get(id)",
    params: idOnly,
    invoke: (c, a) => c.assignments.get(a.id as number),
  },
  {
    id: "assignments.list",
    namespace: "assignments",
    method: "list",
    label: "assignments.list(filter)",
    params: [
      { kind: "numberArray", name: "ids" },
      { kind: "numberArray", name: "subject_ids" },
      { kind: "enumArray", name: "subject_types", options: SUBJECT_TYPES },
      { kind: "numberArray", name: "levels" },
      { kind: "numberArray", name: "srs_stages" },
      { kind: "boolean", name: "burned" },
      { kind: "boolean", name: "hidden" },
      { kind: "boolean", name: "immediately_available_for_lessons" },
      { kind: "boolean", name: "immediately_available_for_review" },
      { kind: "boolean", name: "in_review" },
      { kind: "boolean", name: "started" },
      { kind: "boolean", name: "unlocked" },
      { kind: "datetime", name: "available_after" },
      { kind: "datetime", name: "available_before" },
      { kind: "datetime", name: "updated_after" },
      ...pagination,
    ],
    invoke: (c, a) => c.assignments.list(a),
  },

  {
    id: "reviewStatistics.get",
    namespace: "reviewStatistics",
    method: "get",
    label: "reviewStatistics.get(id)",
    params: idOnly,
    invoke: (c, a) => c.reviewStatistics.get(a.id as number),
  },
  {
    id: "reviewStatistics.list",
    namespace: "reviewStatistics",
    method: "list",
    label: "reviewStatistics.list(filter)",
    params: [
      { kind: "numberArray", name: "ids" },
      { kind: "numberArray", name: "subject_ids" },
      { kind: "enumArray", name: "subject_types", options: SUBJECT_TYPES },
      { kind: "boolean", name: "hidden" },
      { kind: "number", name: "percentages_greater_than" },
      { kind: "number", name: "percentages_less_than" },
      { kind: "datetime", name: "updated_after" },
      ...pagination,
    ],
    invoke: (c, a) => c.reviewStatistics.list(a),
  },

  {
    id: "studyMaterials.get",
    namespace: "studyMaterials",
    method: "get",
    label: "studyMaterials.get(id)",
    params: idOnly,
    invoke: (c, a) => c.studyMaterials.get(a.id as number),
  },
  {
    id: "studyMaterials.list",
    namespace: "studyMaterials",
    method: "list",
    label: "studyMaterials.list(filter)",
    params: [
      { kind: "numberArray", name: "ids" },
      { kind: "numberArray", name: "subject_ids" },
      { kind: "enumArray", name: "subject_types", options: SUBJECT_TYPES },
      { kind: "boolean", name: "hidden" },
      { kind: "datetime", name: "updated_after" },
      ...pagination,
    ],
    invoke: (c, a) => c.studyMaterials.list(a),
  },

  {
    id: "levelProgressions.get",
    namespace: "levelProgressions",
    method: "get",
    label: "levelProgressions.get(id)",
    params: idOnly,
    invoke: (c, a) => c.levelProgressions.get(a.id as number),
  },
  {
    id: "levelProgressions.list",
    namespace: "levelProgressions",
    method: "list",
    label: "levelProgressions.list(filter)",
    params: [
      { kind: "numberArray", name: "ids" },
      { kind: "datetime", name: "updated_after" },
      ...pagination,
    ],
    invoke: (c, a) => c.levelProgressions.list(a),
  },

  {
    id: "resets.get",
    namespace: "resets",
    method: "get",
    label: "resets.get(id)",
    params: idOnly,
    invoke: (c, a) => c.resets.get(a.id as number),
  },
  {
    id: "resets.list",
    namespace: "resets",
    method: "list",
    label: "resets.list(filter)",
    params: [
      { kind: "numberArray", name: "ids" },
      { kind: "datetime", name: "updated_after" },
      ...pagination,
    ],
    invoke: (c, a) => c.resets.list(a),
  },

  {
    id: "spacedRepetitionSystems.get",
    namespace: "spacedRepetitionSystems",
    method: "get",
    label: "spacedRepetitionSystems.get(id)",
    params: idOnly,
    invoke: (c, a) => c.spacedRepetitionSystems.get(a.id as number),
  },
  {
    id: "spacedRepetitionSystems.list",
    namespace: "spacedRepetitionSystems",
    method: "list",
    label: "spacedRepetitionSystems.list(filter)",
    params: [
      { kind: "numberArray", name: "ids" },
      { kind: "datetime", name: "updated_after" },
      ...pagination,
    ],
    invoke: (c, a) => c.spacedRepetitionSystems.list(a),
  },

  {
    id: "voiceActors.get",
    namespace: "voiceActors",
    method: "get",
    label: "voiceActors.get(id)",
    params: idOnly,
    invoke: (c, a) => c.voiceActors.get(a.id as number),
  },
  {
    id: "voiceActors.list",
    namespace: "voiceActors",
    method: "list",
    label: "voiceActors.list(filter)",
    params: [
      { kind: "numberArray", name: "ids" },
      { kind: "datetime", name: "updated_after" },
      ...pagination,
    ],
    invoke: (c, a) => c.voiceActors.list(a),
  },
];

export const METHODS_BY_ID = new Map(METHODS.map((m) => [m.id, m]));

export const METHODS_BY_NAMESPACE = METHODS.reduce<Record<string, MethodEntry[]>>((acc, m) => {
  (acc[m.namespace] ??= []).push(m);
  return acc;
}, {});
