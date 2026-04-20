import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "ghost" | "outline"
  size?: "default" | "sm" | "icon"
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
    ghost: "hover:bg-muted dark:hover:bg-muted/50",
    outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
  }

  const sizes = {
    default: "h-8 px-3 py-1.5",
    sm: "h-7 px-2.5 text-[0.8rem]",
    icon: "h-7 px-2",
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export { Button }
