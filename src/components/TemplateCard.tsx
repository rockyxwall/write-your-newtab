import { useState, useEffect } from 'react'
import { Eye, Zap, ShieldCheck, Pencil, Check, X, Code2, Copy, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Template } from '@/lib/templates'

// ─── Preview component ────────────────────────────────────────────────────────
function Preview({ html }: { html?: string }) {
  const [blobUrl, setBlobUrl] = useState('')

  useEffect(() => {
    if (!html) return
    // Inject style to hide scrollbars in the preview
    const styledHtml = `<style>html, body { overflow: hidden !important; pointer-events: none !important; cursor: default !important; }</style>` + html
    const blob = new Blob([styledHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [html])

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted/30 border-b border-border transition-colors group-hover:bg-muted/50">
      {blobUrl ? (
        <iframe
          src={blobUrl}
          scrolling="no"
          className="absolute inset-0 h-[400%] w-[400%] origin-top-left scale-25 pointer-events-none border-none select-none"
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

// ─── Template Card ────────────────────────────────────────────────────────────
interface TemplateCardProps {
  template: Template
  isActive: boolean
  onActivate: () => void
  onDelete?: () => void
  onRename?: (newName: string) => void
  onDuplicate: () => void
  onEditCode: () => void
  onPreview: () => void
}

export function TemplateCard({
  template,
  isActive,
  onActivate,
  onDelete,
  onRename,
  onDuplicate,
  onEditCode,
  onPreview,
}: TemplateCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(template.name)

  const handleRename = () => {
    if (editName.trim() && editName !== template.name && onRename) {
      onRename(editName.trim())
    }
    setIsEditing(false)
  }

  return (
    <div className="group relative block h-full">
      {/* --- EXTERNAL CORNER GLOW ACCENTS (CONCENTRIC BENDS) --- */}
      <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 blur-[1px] rounded-tl-xl"></div>
      <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 blur-[1px] rounded-tr-xl"></div>
      <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 blur-[1px] rounded-bl-xl"></div>
      <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-0 blur-[1px] rounded-br-xl"></div>

      <div className={cn(
        "bg-card border border-border rounded-xl p-4 flex flex-col h-full transition-all duration-300 hover:border-primary/50 hover:shadow-xl relative z-10 space-y-3",
        isActive && "border-primary/50 ring-1 ring-primary/20 shadow-xl shadow-primary/5"
      )}>
        {/* Cover / Preview Area */}
        <div className="w-full aspect-video overflow-hidden shrink-0 relative rounded-lg border border-border/50 bg-muted/30 group/cover">
          <Preview html={template.html} />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
             <button 
               onClick={(e) => { e.stopPropagation(); onPreview(); }}
               className="h-9 w-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all scale-90 group-hover/cover:scale-100"
               title="Large Preview"
             >
               <Eye size={18} />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onActivate(); }}
               className="h-9 w-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all scale-90 group-hover/cover:scale-100"
               title="Activate"
             >
               <Zap size={18} fill="currentColor" />
             </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-col space-y-2 flex-1 justify-between">
          <div className="space-y-2">
            <div className="flex gap-2 flex-wrap items-center">
              <span className={cn(
                "font-mono text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase border leading-none",
                template.isBuiltin
                  ? "bg-secondary text-secondary-foreground border-transparent"
                  : "bg-transparent text-foreground/80 border-border"
              )}>
                {template.isBuiltin ? 'Built-in' : 'Custom'}
              </span>
              {isActive && (
                <span className="bg-primary text-primary-foreground font-mono text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase leading-none shadow-sm shadow-primary/20 flex items-center gap-1">
                  <ShieldCheck size={10} strokeWidth={2.5} /> Active
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-2 group/name">
              {isEditing ? (
                <div className="flex items-center gap-1 flex-1">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename()
                      if (e.key === 'Escape') {
                        setIsEditing(false)
                        setEditName(template.name)
                      }
                    }}
                    className="w-full bg-muted border border-primary/30 rounded-lg px-2 py-1 text-sm font-bold outline-none"
                  />
                  <button onClick={handleRename} className="text-green-500 hover:text-green-600 transition-colors">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-sans font-black leading-tight tracking-tight group-hover:text-primary transition-colors uppercase text-lg line-clamp-2">
                    {template.name}
                  </h2>
                  {!template.isBuiltin && onRename && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                      className="opacity-0 group-hover/name:opacity-100 p-1 hover:bg-muted rounded-md transition-all shrink-0 mt-0.5"
                    >
                      <Pencil size={12} className="text-muted-foreground" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
             <div className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                {template.isBuiltin ? 'Ready to use' : `Uploaded ${new Date(template.uploadedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit' }).replace(/\//g, '.')}`}
             </div>
             
             <div className="flex items-center gap-1.5">
               {!template.isBuiltin && (
                 <button
                   onClick={(e) => { e.stopPropagation(); onEditCode(); }}
                   className="h-7 w-7 flex items-center justify-center hover:bg-primary/10 rounded-full transition-all text-muted-foreground hover:text-primary"
                   title="Edit Code"
                 >
                   <Code2 size={14} />
                 </button>
               )}
               <button
                 onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                 className="h-7 w-7 flex items-center justify-center hover:bg-primary/10 rounded-full transition-all text-muted-foreground hover:text-primary"
                 title="Duplicate"
               >
                 <Copy size={14} />
               </button>
               {!template.isBuiltin && onDelete && (
                 <button
                   onClick={(e) => { e.stopPropagation(); onDelete(); }}
                   className="h-7 w-7 flex items-center justify-center hover:bg-destructive/10 rounded-full transition-all text-muted-foreground hover:text-destructive"
                   title="Delete"
                 >
                   <Trash2 size={14} />
                 </button>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
