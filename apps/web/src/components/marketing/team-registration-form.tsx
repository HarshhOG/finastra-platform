"use client";

import { startTransition, useState } from "react";
import type { DynamicFormDefinition } from "@finastra/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { postPublicJson } from "@/lib/api/client";

type ParticipantRow = {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  yearOfStudy: string;
};

const emptyParticipant = (): ParticipantRow => ({
  fullName: "",
  email: "",
  phone: "",
  department: "",
  yearOfStudy: ""
});

export function TeamRegistrationForm({
  form
}: {
  form: DynamicFormDefinition;
}) {
  const [participants, setParticipants] = useState<ParticipantRow[]>([emptyParticipant()]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const coreFields = form.fields.filter((field) => field.name !== "specialRequirements");

  return (
    <Card>
      <CardContent className="space-y-8 p-6 md:p-8">
        <div className="space-y-3">
          <h1 className="font-[var(--font-display)] text-3xl font-semibold text-white">{form.title}</h1>
          <p className="max-w-2xl text-sm leading-7 text-white/58">{form.description}</p>
        </div>

        <form
          className="space-y-8"
          onSubmit={(event) => {
            event.preventDefault();
            setIsPending(true);

            const raw = Object.fromEntries(new FormData(event.currentTarget).entries());
            const payload = {
              ...raw,
              participants
            };

            startTransition(async () => {
              try {
                await postPublicJson("/public/register/team", payload);
                setMessage(form.successMessage);
                event.currentTarget.reset();
                setParticipants([emptyParticipant()]);
              } catch (error) {
                setMessage(error instanceof Error ? error.message : "Submission failed.");
              } finally {
                setIsPending(false);
              }
            });
          }}
        >
          <div className="grid gap-5 md:grid-cols-2">
            {coreFields.map((field) => (
              <label
                key={field.id}
                className={field.type === "textarea" ? "space-y-2 md:col-span-2" : "space-y-2"}
              >
                <span className="text-sm font-medium text-white/72">{field.label}</span>
                {field.type === "select" ? (
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
                ) : (
                  <Input
                    name={field.name}
                    type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
                    required={field.required}
                    placeholder={field.placeholder ?? ""}
                  />
                )}
              </label>
            ))}
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-white/72">Special Requirements</span>
              <Textarea name="specialRequirements" placeholder="Accessibility, hardware, or schedule notes" />
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Participants</h2>
                <p className="text-sm text-white/52">Add every participant except the leader.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setParticipants((current) => [...current, emptyParticipant()])}
              >
                Add Participant
              </Button>
            </div>

            <div className="space-y-4">
              {participants.map((participant, index) => (
                <div key={index} className="grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-4 md:grid-cols-2">
                  <Input
                    placeholder="Full Name"
                    value={participant.fullName}
                    onChange={(event) =>
                      setParticipants((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, fullName: event.target.value } : item
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={participant.email}
                    onChange={(event) =>
                      setParticipants((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, email: event.target.value } : item
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="Phone"
                    value={participant.phone}
                    onChange={(event) =>
                      setParticipants((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, phone: event.target.value } : item
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="Department"
                    value={participant.department}
                    onChange={(event) =>
                      setParticipants((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, department: event.target.value } : item
                        )
                      )
                    }
                  />
                  <Input
                    placeholder="Year of Study"
                    value={participant.yearOfStudy}
                    onChange={(event) =>
                      setParticipants((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index ? { ...item, yearOfStudy: event.target.value } : item
                        )
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="justify-start"
                    onClick={() =>
                      setParticipants((current) =>
                        current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  >
                    Remove Row
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" disabled={isPending}>
            {isPending ? "Submitting..." : form.submitLabel}
          </Button>

          {message ? <p className="text-sm text-cyan-100/80">{message}</p> : null}
        </form>
      </CardContent>
    </Card>
  );
}
