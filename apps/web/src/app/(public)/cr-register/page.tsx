import { fetchPublicJson } from "@/lib/api/client";
import type { DynamicFormPayload } from "@/lib/types";
import { DynamicForm } from "@/components/marketing/dynamic-form";

export default async function CrRegisterPage() {
  const form = await fetchPublicJson<DynamicFormPayload>("/public/forms/cr-register");

  return (
    <section className="section-padding mx-auto max-w-4xl py-10 md:py-16">
      <DynamicForm form={form} endpoint="/public/register/cr" />
    </section>
  );
}
