import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground transition-all duration-300 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99]",
        className
      )}
      {...props}
    />
  )
}

function CardPreview({ html, className }: { html?: string; className?: string }) {
  const [blobUrl, setBlobUrl] = React.useState<string>('')

  React.useEffect(() => {
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [html])

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-muted/30 border-b transition-colors group-hover:bg-muted/50", className)}>
      {blobUrl ? (
        <iframe
          src={blobUrl}
          className="absolute inset-0 h-[400%] w-[400%] origin-top-left scale-[0.25] pointer-events-none border-none select-none"
          title="Preview"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 font-mono text-[10px] uppercase tracking-wider">
          No Preview
        </div>
      )}
      <div className="absolute inset-0 bg-transparent z-10" /> 
    </div>
  )
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-4", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-4 pb-4 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-auto flex items-center p-4 pt-0 gap-2", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter, CardPreview }
