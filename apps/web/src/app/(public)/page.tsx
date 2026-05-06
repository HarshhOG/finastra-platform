import { ArrowRight, Shield, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { fetchPublicJson } from "@/lib/api/client";
import type { SiteExperiencePayload } from "@/lib/types";
import { HeroExperience } from "@/components/marketing/hero-experience";
import { SectionIntro } from "@/components/marketing/section-intro";
import { EventsShowcase } from "@/components/marketing/events-showcase";
import { AnnouncementRail } from "@/components/marketing/announcement-rail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const site = await fetchPublicJson<SiteExperiencePayload>("/public/site");

  return (
    <div className="space-y-20 pb-20">
      <HeroExperience hero={site.hero} stats={site.stats} />

      <section className="section-padding mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Futuristic event storytelling",
              body: "Immersive sections, live countdowns, sponsor surfaces, and event detail pages generated from the backend."
            },
            {
              icon: Shield,
              title: "Approval-secured operations",
              body: "Team admins propose edits, super admins review diffs, and audit logs track every publishing decision."
            },
            {
              icon: Zap,
              title: "Admin speed at scale",
              body: "Analytics, exports, filters, and notifications help run a complex campus fest like a product company."
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10">
                    <Icon className="h-5 w-5 text-cyan-200" />
                  </div>
                  <div>
                    <h3 className="font-[var(--font-display)] text-xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">{item.body}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="section-padding mx-auto max-w-7xl space-y-8">
        <SectionIntro
          eyebrow="Featured Events"
          title="A flagship lineup engineered for commerce and finance talent"
          body="Every card below is dynamic, database-driven, and routed to a fully generated event experience with rules, rounds, judges, schedules, downloads, and live announcements."
        />
        <EventsShowcase events={site.featuredEvents} />
        <Button asChild variant="secondary">
          <Link href="/events">
            Explore all 11 events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="section-padding mx-auto max-w-7xl space-y-8">
        <SectionIntro
          eyebrow="Platform Architecture"
          title="A startup-grade operating layer beneath the festival"
          body="The site experience is only one part of the system. Registrations, approvals, content, exports, and notifications are all controlled from the backend."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {site.sections.map((section) => (
            <Card key={section.id}>
              <CardContent className="space-y-4 p-6">
                <div
                  className="h-1 w-16 rounded-full"
                  style={{
                    background: section.accent ?? "#2fffd6"
                  }}
                />
                <h3 className="font-[var(--font-display)] text-2xl font-semibold text-white">
                  {section.title}
                </h3>
                <p className="text-sm leading-7 text-white/58">{section.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="section-padding mx-auto max-w-7xl space-y-8">
        <SectionIntro
          eyebrow="Live Pulse"
          title="Announcements, ops signals, and momentum updates"
          body="The platform is designed to keep participants and organizers aligned with fresh notices, event alerts, and execution updates from the control room."
        />
        <AnnouncementRail announcements={site.announcements} />
      </section>
    </div>
  );
}
