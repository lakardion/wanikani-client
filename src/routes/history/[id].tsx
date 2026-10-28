import { useParams } from "@solidjs/router";
import { createResource, For, Show } from "solid-js";
import { Explanation, Furigana, Section } from "~/components/ExerciseLoop";
import { BackButton, fmtDate, OutcomeBadge } from "~/components/History";
import { getAll } from "~/lib/history";

export default function RecordDetail() {
  const params = useParams<{ id: string }>();
  const [record] = createResource(
    () => params.id,
    async (id) => (await getAll().catch(() => [])).find((r) => r.id === id) ?? null,
  );
  return (
    <div class="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8">
      <header class="flex h-14 items-center">
        <BackButton href="/history" label="History" />
      </header>
      <Show
        when={record()}
        fallback={
          <Show when={record() === null}>
            <p class="py-12 text-center text-sm text-muted-foreground">
              This Exercise is not in History.
            </p>
          </Show>
        }
      >
        {(r) => (
          <div class="flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between text-xs text-muted-foreground">
                <span>{fmtDate(r().finishedAt)}</span>
                <OutcomeBadge outcome={r().outcome} />
              </div>
              <p lang="ja" class="text-2xl leading-loose">
                <Furigana segments={r().exercise.furigana} />
              </p>
              <p class="text-sm">{r().exercise.english}</p>
            </div>
            <Section title="Your attempts">
              <ol class="flex flex-col gap-2">
                <For each={r().attempts}>
                  {(a) => (
                    <li class="rounded-lg bg-muted px-3 py-2 text-sm">
                      <p>
                        {a.answer ? a.answer : <span class="text-muted-foreground">(empty)</span>}
                      </p>
                      <p class="mt-1 text-xs text-muted-foreground">
                        {"giveUp" in a
                          ? "Gave up"
                          : `${a.pass ? "Pass" : "Not passed"} · ${a.score}`}
                      </p>
                      <Show when={!("giveUp" in a) && a.feedback}>
                        {(feedback) => <p class="mt-1 text-xs">{feedback()}</p>}
                      </Show>
                    </li>
                  )}
                </For>
              </ol>
            </Section>
            <div class="-mx-4">
              <Explanation exercise={r().exercise} />
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
