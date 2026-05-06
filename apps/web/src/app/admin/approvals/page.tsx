"use client";

import { useEffect, useState } from "react";
import type { ApprovalRequestView } from "@finastra/types";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { ApprovalsBoard } from "@/components/admin/approvals-board";
import { fetchAdminJson } from "@/lib/api/admin-client";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function AdminApprovalsPage() {
  const { accessToken, user, hydrate } = useAuthStore();
  const [approvals, setApprovals] = useState<ApprovalRequestView[]>([]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetchAdminJson<ApprovalRequestView[]>("/admin/approvals", accessToken).then(setApprovals);
  }, [accessToken]);

  return (
    <DashboardShell
      title="Approval Queue"
      description="Every team-admin edit lands here for super-admin review before it reaches the public experience."
    >
      <ApprovalsBoard approvals={approvals} accessToken={accessToken ?? ""} canReview={user?.role === "SUPER_ADMIN"} />
    </DashboardShell>
  );
}
