import type { DashboardOverview } from "@finastra/types";
import { Card, CardContent } from "@/components/ui/card";

export function StatsGrid({
  metrics
}: {
  metrics: DashboardOverview["metrics"];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardContent className="space-y-3 p-5">
            <p className="text-sm text-white/48">{metric.label}</p>
            <p className="font-[var(--font-display)] text-3xl font-semibold text-white">
              {metric.value}
            </p>
            <p className="text-sm text-cyan-100/72">{metric.delta}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
