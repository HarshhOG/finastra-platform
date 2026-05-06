import type { AnnouncementItem } from "@finastra/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function AnnouncementRail({
  announcements
}: {
  announcements: AnnouncementItem[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {announcements.map((announcement) => (
        <Card key={announcement.id}>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <Badge>{announcement.tone}</Badge>
              <span className="text-xs text-white/40">{formatDate(announcement.publishedAt)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
              <p className="mt-2 text-sm leading-7 text-white/58">{announcement.body}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
