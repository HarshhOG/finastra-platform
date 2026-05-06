"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AdminEventRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  registrationStatus: string;
  workflowStatus: string;
  rounds: Array<unknown>;
};

export function EventsTable({
  events
}: {
  events: AdminEventRow[];
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) {
      return events;
    }

    return events.filter((event) =>
      [event.name, event.slug, event.category].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [deferredQuery, events]);

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
              Managed Events
            </h2>
            <p className="text-sm text-white/48">Live event content under admin control.</p>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/32" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" className="pl-10" />
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((event) => (
            <div key={event.id} className="rounded-[24px] border border-white/10 bg-white/4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-[var(--font-display)] text-xl font-semibold text-white">
                    {event.name}
                  </h3>
                  <p className="mt-1 text-sm text-cyan-100/70">{event.slug}</p>
                </div>
                <span className="rounded-full border border-cyan-200/15 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
                  {event.workflowStatus}
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm text-white/58">
                <div>
                  <p className="text-white/35">Category</p>
                  <p className="mt-1">{event.category}</p>
                </div>
                <div>
                  <p className="text-white/35">Registration</p>
                  <p className="mt-1">{event.registrationStatus}</p>
                </div>
                <div>
                  <p className="text-white/35">Rounds</p>
                  <p className="mt-1">{event.rounds.length}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
