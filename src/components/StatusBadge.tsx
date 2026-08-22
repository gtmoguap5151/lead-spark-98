import { STATUS_LABELS, type LeadStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-accent-foreground border-primary/40",
  contacted: "bg-info/10 text-info border-info/30",
  qualified: "bg-success/10 text-success border-success/30",
  appointment: "bg-steel/10 text-steel border-steel/25",
  won: "bg-success text-success-foreground border-transparent",
  lost: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
