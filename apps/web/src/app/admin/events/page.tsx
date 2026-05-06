"use client";

import { useEffect, useState } from "react";
import { AssetUploadPanel } from "@/components/admin/asset-upload-panel";
import { DashboardShell } from "@/components/admin/dashboard-shell";
import { EventEditorPanel } from "@/components/admin/event-editor-panel";
import { EventsTable } from "@/components/admin/events-table";
import { fetchAdminJson } from "@/lib/api/admin-client";
import { useAuthStore } from "@/lib/stores/auth-store";

type AdminEventRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: string;
  shortDescription: string;
  longDescription: string;
  venue: string;
  mode: "ONLINE" | "OFFLINE" | "HYBRID";
  accent: string;
  participantLimit: number;
  minTeamSize: number;
  maxTeamSize: number;
  registrationStatus: string;
  workflowStatus: string;
  rounds: Array<Record<string, unknown>>;
  sections: Array<Record<string, unknown>>;
  rules: Array<Record<string, unknown>>;
  faqs: Array<Record<string, unknown>>;
  coordinators: Array<Record<string, unknown>>;
  prizes: Array<Record<string, unknown>>;
  schedules: Array<Record<string, unknown>>;
  judgingCriteria: Array<Record<string, unknown>>;
  downloads: Array<Record<string, unknown>>;
  announcements: Array<Record<string, unknown>>;
};

export default function AdminEventsPage() {
  const { accessToken, hydrate } = useAuthStore();
  const [events, setEvents] = useState<AdminEventRow[]>([]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    fetchAdminJson<AdminEventRow[]>("/admin/events", accessToken).then(setEvents);
  }, [accessToken]);

  return (
    <DashboardShell
      title="Managed Events"
      description="Event content inventory, publication state, and round structures controlled by the CMS workflow."
    >
      <div className="space-y-6">
        <EventsTable events={events} />
        {accessToken ? <EventEditorPanel events={events} accessToken={accessToken} /> : null}
        {accessToken ? <AssetUploadPanel accessToken={accessToken} /> : null}
      </div>
    </DashboardShell>
  );
}
