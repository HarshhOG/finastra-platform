"use client";

import { useEffect, useState } from "react";
import type { ApprovalRequestView, DashboardOverview } from "@finastra/types";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { StatsGrid } from "@/components/admin/stats-grid";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { RegistrationsTable } from "@/components/admin/registrations-table";
import { ApprovalsBoard } from "@/components/admin/approvals-board";
import { NotificationsPanel } from "@/components/admin/notifications-panel";
import { fetchAdminJson } from "@/lib/api/admin-client";
import { useAuthStore } from "@/lib/stores/auth-store";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

type RegistrationRow = {
  id: string;
  event: string;
  team: string;
  leader: string;
  college: string;
  members: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const { accessToken, user, hydrate } = useAuthStore();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [approvals, setApprovals] = useState<ApprovalRequestView[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    Promise.all([
      fetchAdminJson<DashboardOverview>("/admin/dashboard", accessToken),
      fetchAdminJson<RegistrationRow[]>("/admin/dashboard/registrations", accessToken),
      fetchAdminJson<ApprovalRequestView[]>("/admin/approvals", accessToken),
      fetchAdminJson<NotificationItem[]>("/admin/notifications", accessToken)
    ]).then(([overviewResponse, registrationResponse, approvalResponse, notificationResponse]) => {
      setOverview(overviewResponse);
      setRegistrations(registrationResponse);
      setApprovals(approvalResponse);
      setNotifications(notificationResponse);
    });
  }, [accessToken]);

  return (
    <DashboardShell
      title="Admin Dashboard"
      description="Analytics, registrations, approvals, and notifications for daily operations."
    >
      {overview ? (
        <div className="space-y-6">
          <StatsGrid metrics={overview.metrics} />
          <AnalyticsPanel overview={overview} />
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <RegistrationsTable rows={registrations} />
            <NotificationsPanel notifications={notifications} />
          </div>
          <ApprovalsBoard
            approvals={approvals}
            accessToken={accessToken ?? ""}
            canReview={user?.role === "SUPER_ADMIN"}
          />
        </div>
      ) : (
        <div className="glass-panel rounded-[28px] p-6 text-sm text-white/58">Loading dashboard...</div>
      )}
    </DashboardShell>
  );
}
