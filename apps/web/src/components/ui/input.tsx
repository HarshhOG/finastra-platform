import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-12 w-full rounded-2xl border border-white/12 bg-slate-950/55 px-4 text-sm text-white outline-none transition focus:border-cyan-300/40 focus:bg-slate-950/80 placeholder:text-white/35",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
