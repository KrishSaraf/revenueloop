"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Eye, PhoneOff, X } from "lucide-react";
import type { Prospect, SalesStrategy } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useRevenueLoop } from "@/lib/store/revenue-loop-context";
import { currency, percent } from "@/lib/utils";

export function ApprovalCard({
  prospect,
  strategy,
  previewSlug,
}: {
  prospect: Prospect;
  strategy?: SalesStrategy;
  previewSlug?: string;
}) {
  const { approveCall, rejectProspect, markDoNotContact, state } = useRevenueLoop();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [dncOpen, setDncOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const handleApprove = async () => {
    setConfirmOpen(false);
    setBusy(true);
    try {
      await approveCall(prospect.id);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.03] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/prospects/${prospect.id}`}
              className="text-sm font-semibold text-zinc-100 underline-offset-2 hover:underline"
            >
              {prospect.name}
            </Link>
            <Badge tone="amber">Awaiting approval</Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {prospect.category} · {prospect.location} · deal value{" "}
            <span className="font-mono text-zinc-300">
              {currency(prospect.estimatedDealValue)}
            </span>
            {strategy ? (
              <>
                {" "}
                · est. conversion{" "}
                <span className="font-mono text-zinc-300">
                  {percent(strategy.conversionProbability * 100)}
                </span>
              </>
            ) : null}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-400">
            Recommended action: place an outbound sales call presenting the verified
            website preview and the {strategy?.packageName ?? "Launch Site Sprint"} package.
          </p>
          <p className="mt-1.5 text-[11px] text-emerald-300/80">
            Calls go out from the VentureMint line (+65 9811 7311) after you approve.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {previewSlug ? (
            <Link href={`/sites/${previewSlug}`}>
              <Button size="sm" variant="ghost" icon={<Eye size={14} />}>
                Preview
              </Button>
            </Link>
          ) : null}
          <Button
            size="sm"
            variant="primary"
            icon={<Check size={14} />}
            disabled={busy || state.safetyLock}
            onClick={() => setConfirmOpen(true)}
          >
            {busy ? "Calling…" : "Approve"}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<X size={14} />}
            onClick={() => setRejectOpen(true)}
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={<PhoneOff size={14} />}
            onClick={() => setDncOpen(true)}
          >
            Do not contact
          </Button>
        </div>
      </div>

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Approve outreach"
      >
        <p className="text-sm leading-relaxed text-zinc-400">
          You are approving an outbound sales call to {prospect.name}. VentureMint will
          dial from +65 9811 7311 — approval is always explicit before any outreach.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApprove}>
            Approve call
          </Button>
        </div>
      </Dialog>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject opportunity">
        <label className="block text-xs font-medium text-zinc-400" htmlFor={`reject-${prospect.id}`}>
          Reason (recorded in the audit log)
        </label>
        <input
          id={`reject-${prospect.id}`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="e.g. Deal value too low for effort"
          className="mt-1.5 w-full rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setRejectOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={reason.trim().length === 0}
            onClick={() => {
              rejectProspect(prospect.id, reason.trim());
              setRejectOpen(false);
              setReason("");
            }}
          >
            Reject
          </Button>
        </div>
      </Dialog>

      <Dialog open={dncOpen} onClose={() => setDncOpen(false)} title="Mark Do Not Contact">
        <p className="text-sm leading-relaxed text-zinc-400">
          This permanently blocks all outbound actions for {prospect.name}: calls,
          messages, emails and payment requests.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDncOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              markDoNotContact(prospect.id, "Operator marked Do Not Contact from approval queue.");
              setDncOpen(false);
            }}
          >
            Block all contact
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
