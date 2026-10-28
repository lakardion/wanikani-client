import { useLocation, useNavigate } from "@solidjs/router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import type { Outcome } from "~/lib/history";

const OUTCOME: Record<Outcome, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pass: { label: "Pass", variant: "default" },
  fail: { label: "Not passed", variant: "secondary" },
  give_up: { label: "Gave up", variant: "outline" },
};

export const OutcomeBadge = (props: { outcome: Outcome }) => (
  <Badge variant={OUTCOME[props.outcome].variant} class="shrink-0">
    {OUTCOME[props.outcome].label}
  </Badge>
);

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Set on in-app links, so the back button can pop the browser history instead of pushing a new entry. */
export const FROM_APP = { fromApp: true };

/** Goes back like the Android back gesture; on a direct open it replaces the page with `href`. */
export function BackButton(props: { href: string; label: string }) {
  const navigate = useNavigate();
  const location = useLocation<typeof FROM_APP>();
  return (
    <Button
      variant="ghost"
      size="sm"
      class="-ml-2"
      onClick={() =>
        location.state?.fromApp ? navigate(-1) : navigate(props.href, { replace: true })
      }
    >
      ← {props.label}
    </Button>
  );
}
