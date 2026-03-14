import type { ButtonHTMLAttributes } from "react";
import { cn } from "./utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
};

export function Button({ className, variant = "default", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center border px-4 py-2 font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variant === "outline"
          ? "border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50"
          : "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800",
        className,
      )}
      {...props}
    />
  );
}
