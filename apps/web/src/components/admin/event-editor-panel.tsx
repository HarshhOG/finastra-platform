"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchAdminJson } from "@/lib/api/admin-client";

type EventEditorRecord = {
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
  sections: Array<Record<string, unknown>>;
  rules: Array<Record<string, unknown>>;
  rounds: Array<Record<string, unknown>>;
  faqs: Array<Record<string, unknown>>;
  coordinators: Array<Record<string, unknown>>;
  prizes: Array<Record<string, unknown>>;
  schedules: Array<Record<string, unknown>>;
  judgingCriteria: Array<Record<string, unknown>>;
  downloads: Array<Record<string, unknown>>;
  announcements: Array<Record<string, unknown>>;
};

const emptyDraft: EventEditorRecord = {
  id: "new",
  slug: "",
  name: "",
  tagline: "",
  category: "Finance",
  shortDescription: "",
  longDescription: "",
  venue: "Main Campus",
  mode: "OFFLINE",
  accent: "#2FFFD6",
  participantLimit: 100,
  minTeamSize: 2,
  maxTeamSize: 4,
  registrationStatus: "OPEN",
  sections: [],
  rules: [],
  rounds: [],
  faqs: [],
  coordinators: [],
  prizes: [],
  schedules: [],
  judgingCriteria: [],
  downloads: [],
  announcements: []
};

export function EventEditorPanel({
  events,
  accessToken
}: {
  events: EventEditorRecord[];
  accessToken: string;
}) {
  const [selectedId, setSelectedId] = useState<string>("new");
  const [draft, setDraft] = useState<EventEditorRecord>(emptyDraft);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (selectedId === "new") {
      setDraft(emptyDraft);
      return;
    }

    const selected = events.find((event) => event.id === selectedId);
    if (selected) {
      setDraft(selected);
    }
  }, [events, selectedId]);

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div>
          <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
            Event Composer
          </h2>
          <p className="text-sm text-white/48">
            Publish directly as super admin or submit an approval request as team admin.
          </p>
        </div>

        <label className="space-y-2">
          <span className="text-sm text-white/68">Choose Event</span>
          <select
            className="h-12 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 text-sm text-white"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            <option value="new">Create New Event</option>
            {events.map((event) => (
              <option key={event.id} value={event.id} className="bg-slate-950 text-white">
                {event.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["slug", "Slug"],
            ["name", "Name"],
            ["tagline", "Tagline"],
            ["category", "Category"],
            ["venue", "Venue"],
            ["accent", "Accent"]
          ].map(([key, label]) => (
            <label key={key} className="space-y-2">
              <span className="text-sm text-white/68">{label}</span>
              <Input
                value={String(draft[key as keyof EventEditorRecord] ?? "")}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [key]: event.target.value
                  }))
                }
              />
            </label>
          ))}
        </div>

        <label className="space-y-2">
          <span className="text-sm text-white/68">Short Description</span>
          <Textarea
            value={draft.shortDescription}
            onChange={(event) => setDraft((current) => ({ ...current, shortDescription: event.target.value }))}
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm text-white/68">Long Description</span>
          <Textarea
            value={draft.longDescription}
            onChange={(event) => setDraft((current) => ({ ...current, longDescription: event.target.value }))}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["participantLimit", "Participant Limit"],
            ["minTeamSize", "Min Team Size"],
            ["maxTeamSize", "Max Team Size"]
          ].map(([key, label]) => (
            <label key={key} className="space-y-2">
              <span className="text-sm text-white/68">{label}</span>
              <Input
                type="number"
                value={Number(draft[key as keyof EventEditorRecord])}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [key]: Number(event.target.value)
                  }))
                }
              />
            </label>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["sections", "Sections JSON"],
            ["rules", "Rules JSON"],
            ["rounds", "Rounds JSON"],
            ["faqs", "FAQs JSON"],
            ["coordinators", "Coordinators JSON"],
            ["prizes", "Prizes JSON"],
            ["schedules", "Schedules JSON"],
            ["judgingCriteria", "Judging Criteria JSON"],
            ["downloads", "Downloads JSON"],
            ["announcements", "Announcements JSON"]
          ].map(([key, label]) => (
            <label key={key} className="space-y-2">
              <span className="text-sm text-white/68">{label}</span>
              <Textarea
                className="min-h-40"
                value={JSON.stringify(draft[key as keyof EventEditorRecord] ?? [], null, 2)}
                onChange={(event) => {
                  try {
                    const parsed = JSON.parse(event.target.value) as Array<Record<string, unknown>>;
                    setDraft((current) => ({
                      ...current,
                      [key]: parsed
                    }));
                    setMessage(null);
                  } catch {
                    setMessage(`Invalid JSON in ${label}.`);
                  }
                }}
              />
            </label>
          ))}
        </div>

        <Button
          size="lg"
          onClick={async () => {
            setMessage("Saving...");

            const payload = {
              slug: draft.slug,
              name: draft.name,
              tagline: draft.tagline,
              category: draft.category,
              shortDescription: draft.shortDescription,
              longDescription: draft.longDescription,
              venue: draft.venue,
              mode: draft.mode,
              accent: draft.accent,
              participantLimit: draft.participantLimit,
              minTeamSize: draft.minTeamSize,
              maxTeamSize: draft.maxTeamSize,
              registrationStatus: draft.registrationStatus,
              sections: draft.sections,
              rules: draft.rules,
              rounds: draft.rounds,
              faqs: draft.faqs,
              coordinators: draft.coordinators,
              prizes: draft.prizes,
              schedules: draft.schedules,
              judgingCriteria: draft.judgingCriteria,
              downloads: draft.downloads,
              announcements: draft.announcements
            };

            try {
              const path = selectedId === "new" ? "/admin/events" : `/admin/events/${selectedId}`;
              const method = selectedId === "new" ? "POST" : "PATCH";
              const result = await fetchAdminJson<{ mode: string; approvalId?: string }>(path, accessToken, {
                method,
                body: JSON.stringify(payload)
              });

              setMessage(
                result.mode === "approval"
                  ? `Change submitted for approval: ${result.approvalId}`
                  : "Event saved directly."
              );
            } catch (error) {
              setMessage(error instanceof Error ? error.message : "Save failed.");
            }
          }}
        >
          Save Event Draft
        </Button>

        {message ? <p className="text-sm text-cyan-100/75">{message}</p> : null}
      </CardContent>
    </Card>
  );
}
