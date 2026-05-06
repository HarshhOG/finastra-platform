"use client";

import { useState } from "react";
import type { ApprovalRequestView } from "@finastra/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAdminJson } from "@/lib/api/admin-client";

export function ApprovalsBoard({
  approvals,
  accessToken,
  canReview
}: {
  approvals: ApprovalRequestView[];
  accessToken: string;
  canReview: boolean;
}) {
  const [items, setItems] = useState(approvals);

  async function review(approvalId: string, action: "approve" | "reject") {
    await fetchAdminJson(`/admin/approvals/${approvalId}/${action}`, accessToken, {
      method: "POST",
      body: JSON.stringify({
        notes: action === "approve" ? "Approved from dashboard." : "Rejected from dashboard."
      })
    });

    setItems((current) =>
      current.map((item) =>
        item.id === approvalId
          ? {
              ...item,
              status: action === "approve" ? "APPROVED" : "REJECTED"
            }
          : item
      )
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div>
          <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
            Approval Center
          </h2>
          <p className="text-sm text-white/48">Review diffs before publication reaches the public site.</p>
        </div>
        <div className="space-y-4">
          {items.map((approval) => (
            <div key={approval.id} className="rounded-[24px] border border-white/10 bg-white/4 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                    {approval.action} {approval.entityType}
                  </p>
                  <h3 className="font-[var(--font-display)] text-xl font-semibold text-white">
                    Request {approval.id.slice(-6)}
                  </h3>
                  <p className="text-sm text-white/48">
                    Submitted by {approval.submittedBy.name} • {approval.status}
                  </p>
                </div>
                {canReview ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => review(approval.id, "approve")}>
                      Approve
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => review(approval.id, "reject")}>
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3">
                {approval.diff.map((change) => (
                  <div key={change.field} className="rounded-2xl border border-white/8 bg-slate-950/40 p-4 text-sm">
                    <p className="font-medium text-white">{change.field}</p>
                    <p className="mt-2 text-white/45">Before: {change.before ?? "empty"}</p>
                    <p className="mt-1 text-cyan-100/72">After: {change.after ?? "empty"}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
