"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

export function RegistrationsTable({
  rows
}: {
  rows: RegistrationRow[];
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filteredRows = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    if (!normalized) {
      return rows;
    }

    return rows.filter((row) =>
      [row.event, row.team, row.leader, row.college].some((value) =>
        value.toLowerCase().includes(normalized)
      )
    );
  }, [deferredQuery, rows]);

  return (
    <Card>
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
              Registration Feed
            </h2>
            <p className="text-sm text-white/48">Search event, team, leader, or college.</p>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/32" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search registrations"
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-white/65">
            <thead className="text-xs uppercase tracking-[0.24em] text-white/35">
              <tr>
                <th className="pb-3">Event</th>
                <th className="pb-3">Team</th>
                <th className="pb-3">College</th>
                <th className="pb-3">Members</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-t border-white/8">
                  <td className="py-4">
                    <p className="font-medium text-white">{row.event}</p>
                    <p className="text-xs text-white/35">{row.leader}</p>
                  </td>
                  <td className="py-4">{row.team}</td>
                  <td className="py-4">{row.college}</td>
                  <td className="py-4">{row.members}</td>
                  <td className="py-4">{row.status}</td>
                  <td className="py-4">{row.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
