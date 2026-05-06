import type { Metadata } from "next";
import { fetchPublicJson } from "@/lib/api/client";
import type { EventCollectionPayload } from "@/lib/types";
import { EventsShowcase } from "@/components/marketing/events-showcase";
import { SectionIntro } from "@/components/marketing/section-intro";

export const metadata: Metadata = {
  title: "Events"
};

export default async function EventsPage() {
  const events = await fetchPublicJson<EventCollectionPayload>("/public/events");

  return (
    <section className="section-padding mx-auto max-w-7xl space-y-10 py-10 md:py-16">
      <SectionIntro
        eyebrow="Dynamic Event Hub"
        title="Eleven database-driven competitions, one premium festival layer"
        body="Each event page is generated from backend content and supports banners, descriptions, rules, rounds, judging criteria, schedules, sponsors, downloads, and registration actions."
      />
      <EventsShowcase events={events} />
    </section>
  );
}
