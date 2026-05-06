import type { TeamPayload } from "@/lib/types";
import { fetchPublicJson } from "@/lib/api/client";
import { SectionIntro } from "@/components/marketing/section-intro";
import { Card, CardContent } from "@/components/ui/card";

export default async function OrganisingTeamPage() {
  const team = await fetchPublicJson<TeamPayload>("/public/team");

  return (
    <section className="section-padding mx-auto max-w-7xl space-y-10 py-10 md:py-16">
      <SectionIntro
        eyebrow="Organising Team"
        title="A cross-functional crew running the fest like a product company"
        body={team.sections[0]?.body ?? "Meet the operators, strategists, and event leads behind the experience."}
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {team.members.map((member) => (
          <Card key={member.id}>
            <CardContent className="space-y-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 font-[var(--font-display)] text-xl font-semibold text-cyan-100">
                {member.name.slice(0, 1)}
              </div>
              <div>
                <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
                  {member.name}
                </h2>
                <p className="mt-1 text-sm text-cyan-100/72">{member.title}</p>
                <p className="mt-1 text-sm text-white/48">{member.division}</p>
              </div>
              <a href={`mailto:${member.email}`} className="text-sm text-white/60 transition hover:text-white">
                {member.email}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
