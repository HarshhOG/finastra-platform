"use client";

import type { DashboardOverview } from "@finastra/types";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export function AnalyticsPanel({
  overview
}: {
  overview: DashboardOverview;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
              Registrations by Event
            </h2>
            <p className="text-sm text-white/48">Compare load across the event portfolio.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.registrationsByEvent}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} interval={0} angle={-15} height={70} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#2fffd6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
              Registrations by College
            </h2>
            <p className="text-sm text-white/48">Track participation depth across institutions.</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.registrationsByCollege}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} interval={0} angle={-15} height={70} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "#020617",
                    borderRadius: 18,
                    border: "1px solid rgba(255,255,255,0.08)"
                  }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#ffbf6e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
