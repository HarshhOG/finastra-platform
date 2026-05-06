import type { Metadata } from "next";
import Link from "next/link";
import { Download, MapPin, Trophy, UsersRound } from "lucide-react";
import { notFound } from "next/navigation";
import type { EventDetail } from "@finastra/types";
import { fetchPublicJson } from "@/lib/api/client";
import { AnnouncementRail } from "@/components/marketing/announcement-rail";
import { CountdownTimer } from "@/components/marketing/countdown-timer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getEvent(slug: string) {
  return fetchPublicJson<EventDetail>(`/public/events/${slug}`, { revalidate: 120 }).catch(() => null);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  return {
    title: event?.name ?? "Event"
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-14 pb-20">
      <section className="section-padding mx-auto max-w-7xl py-10 md:py-16">
        <div
          className="overflow-hidden rounded-[36px] border border-white/10 p-6 md:p-10"
          style={{
            background: `radial-gradient(circle at top left, ${event.accent}2A, transparent 34%), linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))`
          }}
        >
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Badge>{event.category}</Badge>
              <div className="space-y-4">
                <h1 className="font-[var(--font-display)] text-4xl font-bold tracking-[-0.05em] text-white md:text-6xl">
                  {event.name}
                </h1>
                <p className="text-lg text-cyan-100/80">{event.tagline}</p>
                <p className="max-w-3xl text-sm leading-8 text-white/62 md:text-base">
                  {event.longDescription}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                  <UsersRound className="h-5 w-5 text-cyan-200" />
                  <p className="mt-4 text-sm text-white/55">Team Size</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {event.minTeamSize}-{event.maxTeamSize} members
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                  <Trophy className="h-5 w-5 text-cyan-200" />
                  <p className="mt-4 text-sm text-white/55">Prize Pool</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {event.prizes.map((prize) => prize.value).join(" + ")}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-4">
                  <MapPin className="h-5 w-5 text-cyan-200" />
                  <p className="mt-4 text-sm text-white/55">Venue</p>
                  <p className="mt-1 text-lg font-semibold text-white">{event.venue}</p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <CountdownTimer target={event.countdownTo ?? null} />
              <Card>
                <CardContent className="space-y-4 p-6">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/42">Quick Actions</p>
                  <Button asChild size="lg" className="w-full">
                    <Link href="/team-pre-registration">Register Team</Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg" className="w-full">
                    <Link href="/college-register">Register College</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-6 p-6 md:p-8">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white">
              Event Storyline
            </h2>
            {event.sections.map((section) => (
              <div key={section.id} className="space-y-2">
                <h3 className="text-lg font-medium text-white">{section.title}</h3>
                <p className="text-sm leading-7 text-white/58">{section.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 p-6 md:p-8">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white">
              Rules
            </h2>
            <div className="space-y-4">
              {event.rules.map((rule) => (
                <div key={rule.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <h3 className="font-medium text-white">{rule.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/58">{rule.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="section-padding mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-6 p-6 md:p-8">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white">
              Rounds
            </h2>
            <div className="space-y-4">
              {event.rounds.map((round) => (
                <div key={round.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-lg font-medium text-white">
                      Round {round.sequence}: {round.title}
                    </p>
                    <span className="text-xs uppercase tracking-[0.24em] text-cyan-100/65">
                      {round.startsAt ? formatDate(round.startsAt) : "Schedule pending"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/58">{round.summary}</p>
                  <p className="mt-2 text-sm text-white/48">Judging focus: {round.judgingFocus}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 p-6 md:p-8">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white">
              Judging Criteria
            </h2>
            <div className="space-y-4">
              {event.judgingCriteria.map((criterion) => (
                <div key={criterion.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-medium text-white">{criterion.title}</h3>
                    <span className="text-sm text-cyan-100/70">{criterion.weightage}%</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/58">{criterion.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="section-padding mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardContent className="space-y-6 p-6 md:p-8">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white">
              Schedule
            </h2>
            <div className="space-y-4">
              {event.schedules.map((schedule) => (
                <div key={schedule.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="font-medium text-white">{schedule.label}</h3>
                    <span className="text-sm text-cyan-100/70">{formatDate(schedule.startsAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/58">{schedule.description}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/42">{schedule.venue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-6 p-6 md:p-8">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white">
              Coordinators and Downloads
            </h2>
            <div className="space-y-4">
              {event.coordinators.map((coordinator) => (
                <div key={coordinator.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <p className="font-medium text-white">{coordinator.name}</p>
                  <p className="mt-1 text-sm text-cyan-100/70">{coordinator.role}</p>
                  <p className="mt-3 text-sm text-white/58">{coordinator.email}</p>
                  <p className="text-sm text-white/58">{coordinator.phone}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {event.downloads.map((download) => (
                <a
                  key={download.id}
                  href={download.url}
                  className="flex items-center justify-between rounded-[22px] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white transition hover:border-cyan-200/30"
                >
                  <span>{download.title}</span>
                  <Download className="h-4 w-4 text-cyan-200" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="section-padding mx-auto max-w-7xl space-y-8">
        <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white md:text-3xl">
          Live Announcements
        </h2>
        <AnnouncementRail announcements={event.announcements} />
      </section>

      {event.sponsors.length > 0 ? (
        <section className="section-padding mx-auto max-w-7xl">
          <Card>
            <CardContent className="space-y-6 p-6 md:p-8">
              <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white">
                Sponsors
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {event.sponsors.map((sponsor) => (
                  <div key={sponsor.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-white/38">{sponsor.tier}</p>
                    <p className="mt-3 text-lg font-medium text-white">{sponsor.name}</p>
                    {sponsor.websiteUrl ? (
                      <a
                        href={sponsor.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm text-cyan-100/75"
                      >
                        Visit sponsor
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      {event.gallery.length > 0 ? (
        <section className="section-padding mx-auto max-w-7xl">
          <Card>
            <CardContent className="space-y-6 p-6 md:p-8">
              <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white">
                Gallery
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {event.gallery.map((asset) => (
                  <div
                    key={asset.id}
                    className="aspect-[4/3] rounded-[24px] border border-white/10 bg-white/5 bg-cover bg-center"
                    style={{ backgroundImage: `url(${asset.url})` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <section className="section-padding mx-auto max-w-7xl">
        <Card>
          <CardContent className="space-y-6 p-6 md:p-8">
            <h2 className="font-[var(--font-display)] text-2xl font-semibold text-white">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {event.faqs.map((faq) => (
                <div key={faq.id} className="rounded-[22px] border border-white/10 bg-white/4 p-4">
                  <h3 className="font-medium text-white">{faq.question}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/58">{faq.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
