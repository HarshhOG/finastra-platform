import Link from "next/link";
import { ArrowUpRight, CalendarClock, Trophy, UsersRound } from "lucide-react";
import type { EventCard } from "@finastra/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function EventsShowcase({
  events
}: {
  events: EventCard[];
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.slug}`}>
          <Card className="group relative h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-cyan-200/30">
            <div
              className="absolute inset-0 opacity-40 blur-3xl transition duration-500 group-hover:opacity-60"
              style={{
                background: `radial-gradient(circle at top left, ${event.accent}55, transparent 60%)`
              }}
            />
            <CardContent className="relative flex h-full flex-col gap-6 p-6">
              <div className="flex items-start justify-between">
                <Badge>{event.category}</Badge>
                <ArrowUpRight className="h-4 w-4 text-white/45 transition group-hover:text-cyan-200" />
              </div>
              <div>
                <h3 className="font-[var(--font-display)] text-2xl font-semibold text-white">
                  {event.name}
                </h3>
                <p className="mt-2 text-sm text-cyan-100/75">{event.tagline}</p>
                <p className="mt-4 text-sm leading-7 text-white/58">{event.shortDescription}</p>
              </div>
              <div className="mt-auto grid gap-3 text-sm text-white/62">
                <div className="flex items-center gap-2">
                  <UsersRound className="h-4 w-4 text-cyan-200" />
                  {event.minTeamSize}-{event.maxTeamSize} members
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-cyan-200" />
                  {event.participantLimit} participant ceiling
                </div>
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-cyan-200" />
                  Countdown synced from backend
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
