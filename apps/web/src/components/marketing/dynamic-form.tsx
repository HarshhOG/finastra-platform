"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import type { DynamicFormDefinition } from "@finastra/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postPublicJson } from "@/lib/api/client";

function FieldRenderer({
  field
}: {
  field: DynamicFormDefinition["fields"][number];
}) {
  if (field.type === "textarea") {
    return <Textarea name={field.name} placeholder={field.placeholder ?? ""} required={field.required} />;
  }

  if (field.type === "select") {
    return (
      <select
        name={field.name}
        required={field.required}
        className="h-12 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/80"
      >
        <option value="">Select {field.label}</option>
        {field.options?.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-950 text-white">
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Input
      name={field.name}
      type={field.type === "tel" ? "tel" : field.type === "email" ? "email" : "text"}
      placeholder={field.placeholder ?? ""}
      required={field.required}
    />
  );
}

export function DynamicForm({
  form,
  endpoint
}: {
  form: DynamicFormDefinition;
  endpoint: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-8 p-6 md:p-8">
        <div className="space-y-3">
          <h1 className="font-[var(--font-display)] text-3xl font-semibold text-white">{form.title}</h1>
          <p className="max-w-2xl text-sm leading-7 text-white/58">{form.description}</p>
        </div>

        <form
          className="grid gap-5 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const payload = Object.fromEntries(new FormData(event.currentTarget).entries());

            startTransition(async () => {
              try {
                await postPublicJson(endpoint, payload);
                setMessage(form.successMessage);
                event.currentTarget.reset();
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Submission failed.");
              }
            });
          }}
        >
          {form.fields.map((field, index) => (
            <motion.label
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"}
            >
              <span className="text-sm font-medium text-white/72">{field.label}</span>
              <FieldRenderer field={field} />
              {field.helperText ? <span className="text-xs text-white/42">{field.helperText}</span> : null}
            </motion.label>
          ))}

          <div className="md:col-span-2">
            <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? "Submitting..." : form.submitLabel}
            </Button>
          </div>

          {message ? (
            <p className="md:col-span-2 text-sm text-cyan-100/80">{message}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
