"use client";

import { useEffect, useState } from "react";
import type { ApprovalRequestView, DashboardOverview } from "@finastra/types";
import { Download } from "lucide-react";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { StatsGrid } from "@/components/admin/stats-grid";
import { ApprovalsBoard } from "@/components/admin/approvals-board";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchAdminJson } from "@/lib/api/admin-client";
import { getApiBaseUrl } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function SuperAdminOverviewPage() {
  const { accessToken, hydrate } = useAuthStore();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [approvals, setApprovals] = useState<ApprovalRequestView[]>([]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    Promise.all([
      fetchAdminJson<DashboardOverview>("/admin/dashboard", accessToken),
      fetchAdminJson<ApprovalRequestView[]>("/admin/approvals", accessToken)
    ]).then(([overviewResponse, approvalsResponse]) => {
      setOverview(overviewResponse);
      setApprovals(approvalsResponse);
    });
  }, [accessToken]);

  const exportLinks = [
    "registrations",
    "colleges",
    "payments",
    "teams",
    "attendance"
  ] as const;

  return (
    <DashboardShell
      title="Super Admin Panel"
      description="System-wide approvals, export controls, and executive metrics for the FINASTRA operating layer."
    >
      {overview ? (
        <div className="space-y-6">
          <StatsGrid metrics={overview.metrics} />
          <AnalyticsPanel overview={overview} />

          <Card>
            <CardContent className="space-y-5 p-6">
              <div>
                <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
                  Export Center
                </h2>
                <p className="text-sm text-white/48">
                  Download CSV exports for operations, finance, and attendance workflows.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                {exportLinks.map((type) => (
                  <Button
                    key={type}
                    variant="secondary"
                    className="justify-between"
                    onClick={async () => {
                      if (!accessToken) {
                        return;
                      }

                      const response = await fetch(`${getApiBaseUrl()}/admin/exports/${type}.csv`, {
                        headers: {
                          Authorization: `Bearer ${accessToken}`
                        }
                      });
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = `${type}.csv`;
                      link.click();
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    <span>{type}</span>
                    <Download className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <ApprovalsBoard approvals={approvals} accessToken={accessToken ?? ""} canReview />
        </div>
      ) : (
        <div className="glass-panel rounded-[28px] p-6 text-sm text-white/58">Loading super admin overview...</div>
      )}
    </DashboardShell>
  );
}
