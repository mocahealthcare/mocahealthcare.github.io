import type { HTMLAttributes } from "react";
import { cn } from "./utils";

type BadgeProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "secondary";
};

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border text-sm font-medium",
        variant === "secondary" && "border-neutral-200 bg-neutral-100 text-neutral-700",
        className,
      )}
      {...props}
    />
  );
}
