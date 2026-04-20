import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-primary text-primary-foreground border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent",
    outline: "border-border text-foreground",
  }

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
