import { cn } from "@/lib/utils";

export function Badge({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-cyan-200/15 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-100",
        className
      )}
    >
      {children}
    </span>
  );
}
