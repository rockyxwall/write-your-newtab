import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import {
  Moon, Sun, Upload, Trash2, Zap,
  CheckCircle2, LayoutGrid, Sparkles,
  Download, FileUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getBuiltinTemplates, type Template } from '@/lib/templates'
import { activeTemplateHtml, activeTemplateId, userTemplates } from '@/lib/storage'
import { sanitizeHtml } from '@/lib/sanitize'

// ─── Types ────────────────────────────────────────────────────────────────────
interface BackupData {
  version: number
  userTemplates: Template[]
  activeTemplateId: string
}

// ─── Dark mode hook ───────────────────────────────────────────────────────────
// Reads initial state from <html> class (set by theme-init.js before render)
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('wyn-theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark] as const
}

// ─── Preview component ────────────────────────────────────────────────────────
function Preview({ html }: { html?: string }) {
  const [blobUrl, setBlobUrl] = useState('')

  useEffect(() => {
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    setBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [html])

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-muted/30 border-b border-border transition-colors group-hover:bg-muted/50">
      {blobUrl ? (
        <iframe
          src={blobUrl}
          className="absolute inset-0 h-[400%] w-[400%] origin-top-left scale-25 pointer-events-none border-none select-none"
          title="Preview"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground/40 font-mono text-[10px] uppercase tracking-wider">
          No Preview
        </div>
      )}
      {/* Click barrier over iframe */}
      <div className="absolute inset-0 bg-transparent z-10" />
    </div>
  )
}

// ─── Template Card ────────────────────────────────────────────────────────────
function TemplateCard({
  template,
  isActive,
  onActivate,
  onDelete,
}: {
  template: Template
  isActive: boolean
  onActivate: () => void
  onDelete?: () => void
}) {
  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-all duration-300',
        'hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 active:scale-[0.99]',
        isActive && 'border-primary/50 shadow-lg shadow-primary/5'
      )}
    >
      <Preview html={template.html} />

      {/* Title + Badge */}
      <div className="p-3 pb-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[11px] font-bold leading-tight uppercase tracking-tight">
            {template.name}
          </h3>
          <span
            className={cn(
              'shrink-0 inline-flex items-center justify-center rounded-full border px-1.5 py-0 h-4 text-[8px] font-black uppercase tracking-wide transition-colors',
              template.isBuiltin
                ? 'bg-secondary text-secondary-foreground border-transparent'
                : 'border-border text-foreground'
            )}
          >
            {template.isBuiltin ? 'Built-in' : 'Custom'}
          </span>
        </div>
      </div>

      {/* Active indicator */}
      <div className="px-3 py-2 flex-grow">
        {isActive ? (
          <div className="flex items-center gap-1 text-[9px] text-green-600 dark:text-green-400 font-black uppercase tracking-widest">
            <CheckCircle2 size={10} strokeWidth={3} />
            <span>Active</span>
          </div>
        ) : (
          <div className="h-3" />
        )}
      </div>

      {/* Actions */}
      <div className="p-3 pt-0 mt-auto flex items-center gap-1.5">
        {isActive ? (
          <div className="flex-1 inline-flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground h-8 px-3 text-[10px] font-bold uppercase tracking-wider">
            Selected
          </div>
        ) : (
          <button
            onClick={onActivate}
            className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-8 px-3 text-[10px] font-bold uppercase tracking-wider shadow-sm cursor-pointer transition-all hover:bg-primary/90 active:translate-y-px"
          >
            <Zap size={10} className="mr-1" />
            Activate
          </button>
        )}
        {!template.isBuiltin && onDelete && (
          <button
            onClick={onDelete}
            className="inline-flex items-center justify-center rounded-lg h-8 w-8 p-0 shrink-0 cursor-pointer bg-destructive/10 text-destructive-foreground hover:bg-destructive/20 transition-all active:translate-y-px"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const [dark, setDark] = useDarkMode()
  const [activeId, setActiveId] = useState('')
  const [userList, setUserList] = useState<Template[]>([])
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const backupRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const builtins = getBuiltinTemplates()

  useEffect(() => {
    refreshData()
  }, [])

  async function refreshData() {
    const [id, saved] = await Promise.all([
      activeTemplateId.getValue(),
      userTemplates.getValue(),
    ])
    setUserList(saved || [])
    if (!id && builtins.length > 0) {
      doActivate(builtins[0])
    } else {
      setActiveId(id)
    }
  }

  function showStatus(msg: string, ok: boolean) {
    setStatus({ msg, ok })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setStatus(null), 3000)
  }

  async function doActivate(template: Template) {
    await Promise.all([
      activeTemplateId.setValue(template.id),
      activeTemplateHtml.setValue(template.html),
    ])
    setActiveId(template.id)
    showStatus(`"${template.name}" activated.`, true)
  }

  async function doDelete(id: string) {
    const updated = userList.filter((t) => t.id !== id)
    await userTemplates.setValue(updated)
    setUserList(updated)
    if (activeId === id) {
      const defaultT = builtins[0]
      if (defaultT) doActivate(defaultT)
      else {
        await Promise.all([
          activeTemplateId.setValue(''),
          activeTemplateHtml.setValue(''),
        ])
        setActiveId('')
      }
    }
    showStatus('Template deleted.', true)
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.html')) {
      showStatus('Please upload a .html file.', false)
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const raw = ev.target?.result as string
        if (!raw) {
          showStatus('File is empty.', false)
          return
        }

        const sanitized = sanitizeHtml(raw)

        const newTemplate: Template = {
          id: `user-${Date.now()}`,
          name: file.name.replace(/\.html$/i, ''),
          html: sanitized,
          isBuiltin: false,
          uploadedAt: new Date().toISOString(),
        }

        const updated = [...userList, newTemplate]
        await userTemplates.setValue(updated)
        setUserList(updated)
        await doActivate(newTemplate)
        showStatus(`"${newTemplate.name}" uploaded and activated.`, true)
      } catch (err) {
        console.error('Upload failed:', err)
        showStatus('Failed to process or save file.', false)
      }
    }

    reader.onerror = () => {
      showStatus('Failed to read file.', false)
    }

    reader.readAsText(file)
    e.target.value = ''
  }

  async function handleExport() {
    try {
      const data: BackupData = {
        version: 1,
        userTemplates: userList,
        activeTemplateId: activeId,
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `wyntab-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      showStatus('Backup exported successfully.', true)
    } catch (err) {
      showStatus('Failed to export backup.', false)
    }
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const raw = ev.target?.result as string
        const data = JSON.parse(raw) as BackupData

        if (!data.userTemplates || !Array.isArray(data.userTemplates)) {
          throw new Error('Invalid backup format')
        }

        await userTemplates.setValue(data.userTemplates)
        if (data.activeTemplateId) {
          const allTemplates = [...builtins, ...data.userTemplates]
          const active = allTemplates.find(t => t.id === data.activeTemplateId)
          if (active) {
            await doActivate(active)
          }
        }

        await refreshData()
        showStatus('Backup imported successfully.', true)
      } catch (err) {
        showStatus('Failed to import backup. Invalid file.', false)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-dvh bg-background text-foreground transition-colors duration-300">

      {/* ── Header ── */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Sparkles size={16} className="text-primary-foreground sm:hidden" />
              <Sparkles size={18} className="text-primary-foreground hidden sm:block" />
            </div>
            <span className="text-base sm:text-lg font-black uppercase tracking-tighter italic">WYNTab</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <input type="file" ref={fileRef} className="hidden" accept=".html" onChange={handleFile} />
            <input type="file" ref={backupRef} className="hidden" accept=".json" onChange={handleImport} />
            
            <div className="flex items-center bg-muted/50 rounded-full p-1 gap-1 border border-border/50">
               <button
                onClick={handleExport}
                title="Export Backup"
                className="inline-flex items-center justify-center rounded-full h-7 w-7 sm:h-8 sm:w-8 cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground active:translate-y-px"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => backupRef.current?.click()}
                title="Import Backup"
                className="inline-flex items-center justify-center rounded-full h-7 w-7 sm:h-8 sm:w-8 cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground active:translate-y-px"
              >
                <FileUp size={14} />
              </button>
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-wider text-[10px] h-8 sm:h-9 px-3 sm:px-4 shadow-sm cursor-pointer transition-all hover:bg-primary/90 active:translate-y-px"
            >
              <Upload size={14} className="mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Upload HTML</span>
              <span className="xs:hidden">Upload</span>
            </button>
            <button
              onClick={() => setDark(!dark)}
              aria-label="Toggle dark mode"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background h-8 w-8 sm:h-9 sm:w-9 cursor-pointer transition-all hover:bg-accent hover:text-accent-foreground active:translate-y-px"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-16">

        {/* Built-in templates */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 border-b border-border/50 pb-2">
            <LayoutGrid size={14} className="text-muted-foreground" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Built-in Gallery
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {builtins.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                isActive={t.id === activeId}
                onActivate={() => doActivate(t)}
              />
            ))}
          </div>
        </section>

        {/* User templates */}
        {userList.length > 0 && (
          <section className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <Upload size={14} className="text-muted-foreground" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                Your Custom Uploads
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {userList.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  isActive={t.id === activeId}
                  onActivate={() => doActivate(t)}
                  onDelete={() => doDelete(t.id)}
                />
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ── Footer ── */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-border/50">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest text-center">
          Crafted for your perfect new tab experience
        </p>
      </footer>

      {/* ── Status toast ── */}
      {status && (
        <div className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className={cn(
            'rounded-full border px-4 sm:px-6 py-2.5 sm:py-3 text-[11px] font-bold uppercase tracking-widest shadow-2xl backdrop-blur-xl whitespace-nowrap',
            status.ok
              ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400'
              : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
          )}>
            {status.msg}
          </div>
        </div>
      )}

    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Dashboard />)