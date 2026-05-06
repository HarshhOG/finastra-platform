import { fetchPublicJson } from "@/lib/api/client";
import type { DynamicFormPayload } from "@/lib/types";
import { TeamRegistrationForm } from "@/components/marketing/team-registration-form";

export default async function TeamPreRegistrationPage() {
  const form = await fetchPublicJson<DynamicFormPayload>("/public/forms/team-pre-registration");

  return (
    <section className="section-padding mx-auto max-w-5xl py-10 md:py-16">
      <TeamRegistrationForm form={form} />
    </section>
  );
}
