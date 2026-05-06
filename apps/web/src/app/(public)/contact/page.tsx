import type { ContactPayload } from "@/lib/types";
import { fetchPublicJson } from "@/lib/api/client";
import { SectionIntro } from "@/components/marketing/section-intro";
import { Card, CardContent } from "@/components/ui/card";

export default async function ContactPage() {
  const contact = await fetchPublicJson<ContactPayload>("/public/contact");

  return (
    <section className="section-padding mx-auto max-w-7xl space-y-10 py-10 md:py-16">
      <SectionIntro
        eyebrow="Contact"
        title={contact.sections[0]?.title ?? "Reach the FINASTRA desk"}
        body={contact.sections[0]?.body ?? "Support, sponsorship, and event communication channels."}
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {contact.channels.map((channel) => (
          <Card key={channel.id}>
            <CardContent className="space-y-3 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-white/42">{channel.label}</p>
              <a href={channel.href} className="text-lg font-medium text-white transition hover:text-cyan-100">
                {channel.value}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
