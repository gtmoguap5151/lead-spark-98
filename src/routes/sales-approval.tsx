import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/sales-approval")({
  head: () => ({ meta: [{ title: "Sales Approval Inbox — Lead Spark" }] }),
  component: SalesApprovalPage,
});

type SalesRow = {
  id: string;
  status: string;
  subject: string | null;
  body: string | null;
  created_at: string;
  sales_prospects: {
    company_name: string;
    contact_name: string | null;
    email: string | null;
    trade: string | null;
    city: string | null;
    state: string | null;
  } | null;
};

function SalesApprovalPage() {
  const [rows, setRows] = useState<SalesRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales_activities")
      .select(
        "id,status,subject,body,created_at,sales_prospects(company_name,contact_name,email,trade,city,state)",
      )
      .in("status", ["queued", "drafted"])
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as SalesRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const generateDrafts = async () => {
    setGenerating(true);
    const { error } = await supabase.functions.invoke("sales-dispatcher", { body: {} });
    if (error) toast.error(error.message);
    else toast.success("Draft generation completed");
    await load();
    setGenerating(false);
  };

  const review = async (id: string, action: "send" | "reject") => {
    setWorkingId(id);
    const { error } = await supabase.functions.invoke("sales-approval", {
      body: { activity_id: id, action },
    });
    if (error) toast.error(error.message);
    else toast.success(action === "send" ? "Email approved and sent" : "Draft rejected");
    await load();
    setWorkingId(null);
  };

  const queued = rows.filter((row) => row.status === "queued").length;
  const drafted = rows.filter((row) => row.status === "drafted").length;

  return (
    <AppShell
      title="Sales Approval Inbox"
      subtitle="Review AI outreach before anything leaves Lead Spark"
      requireRole="admin"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => void generateDrafts()}
            disabled={generating || queued === 0}
          >
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
            Generate Drafts
          </Button>
        </div>
      }
    >
      <div className="mb-5 grid grid-cols-2 gap-3">
        <div className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Queued
          </p>
          <p className="mt-1 font-display text-3xl font-bold">{queued}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Ready for review
          </p>
          <p className="mt-1 font-display text-3xl font-bold">{drafted}</p>
        </div>
      </div>

      <p className="mb-5 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
        Nothing sends when a draft is generated. Sending requires your approval, a final global
        privacy-suppression check, and configured business identity and mailing-address details. A
        compliance footer is added at send time.
      </p>

      {loading ? (
        <div className="surface-card flex items-center justify-center p-10 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Loading sales work…
        </div>
      ) : rows.length === 0 ? (
        <div className="surface-card p-8 text-center">
          <CheckCircle2 className="mx-auto size-10 text-success" />
          <h2 className="mt-3 text-xl font-bold uppercase">Inbox clear</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            No queued or drafted outreach needs attention.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const prospect = row.sales_prospects;
            const busy = workingId === row.id;
            return (
              <article key={row.id} className="surface-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow text-primary">
                      {row.status === "drafted" ? "Ready for approval" : "Waiting for draft"}
                    </p>
                    <h2 className="mt-1 text-xl font-bold uppercase">
                      {prospect?.company_name ?? "Contractor prospect"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[prospect?.contact_name, prospect?.trade, prospect?.city, prospect?.state]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {prospect?.email ?? "No email"}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase">
                    {row.status}
                  </span>
                </div>

                {row.status === "drafted" ? (
                  <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Subject
                    </p>
                    <p className="mt-1 font-semibold">{row.subject}</p>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6">{row.body}</p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    This item is queued. Tap Generate Drafts to let the AI sales agent prepare the
                    email for review.
                  </div>
                )}

                {row.status === "drafted" ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() => void review(row.id, "reject")}
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <XCircle className="size-4" />
                      )}{" "}
                      Reject
                    </Button>
                    <Button disabled={busy} onClick={() => void review(row.id, "send")}>
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}{" "}
                      Send
                    </Button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
