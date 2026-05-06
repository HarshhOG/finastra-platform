import { Badge } from "@/components/ui/badge";

export function SectionIntro({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-3xl space-y-4">
      <Badge>{eyebrow}</Badge>
      <h2 className="font-[var(--font-display)] text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
        {title}
      </h2>
      <p className="text-sm leading-7 text-white/62 md:text-base">{body}</p>
    </div>
  );
}
