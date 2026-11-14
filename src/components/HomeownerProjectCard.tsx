import { HardHat, Hourglass } from "lucide-react";
import { HOMEOWNER_STATUS_LABELS, type Contractor, type LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-accent-foreground border-primary/40",
  contacted: "bg-info/10 text-info border-info/30",
  qualified: "bg-success/10 text-success border-success/30",
  appointment: "bg-steel/10 text-steel border-steel/25",
  won: "bg-success text-success-foreground border-transparent",
  lost: "bg-muted text-muted-foreground border-border",
};

/** Project status in plain homeowner language (no pipeline jargon). */
export function HomeownerStatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        STYLES[status],
        className,
      )}
    >
      {HOMEOWNER_STATUS_LABELS[status]}
    </span>
  );
}

/**
 * The contractor matched to a homeowner's project — or, honestly, that none is
 * assigned yet. Never renders placeholder or fake contractor details.
 */
export function MatchedContractor({ contractor }: { contractor: Contractor | null }) {
  if (!contractor) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Hourglass className="size-5" />
        </span>
        <div>
          <p className="font-semibold">No contractor assigned yet</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your project is in line for hand-matching. When a verified local contractor is
            matched to it, their name and phone number will show here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <HardHat className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{contractor.companyName}</p>
        <p className="text-sm text-muted-foreground">
          {contractor.contactName}
          {contractor.city ? ` · ${contractor.city}` : ""}
        </p>
        {contractor.phone ? (
          <a
            href={`tel:${contractor.phone}`}
            className="mt-1 inline-block text-sm font-semibold text-accent-foreground underline"
          >
            {contractor.phone}
          </a>
        ) : null}
      </div>
    </div>
  );
}
