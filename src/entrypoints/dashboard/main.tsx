import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import { Moon, Sun, Upload, Trash2, Zap, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getBuiltinTemplates, type Template } from '@/lib/templates'
import { activeTemplateHtml, activeTemplateId, userTemplates } from '@/lib/storage'
import { sanitizeHtml } from '@/lib/sanitize'

// ─── Dark mode hook ───────────────────────────────────────────────────────────
function useDarkMode() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('wyn-theme') === 'dark' ||
      (!localStorage.getItem('wyn-theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('wyn-theme', dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark] as const
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
    <Card className={isActive ? 'ring-2 ring-primary' : 'hover:shadow-md'}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium leading-tight">{template.name}</CardTitle>
          <Badge
            variant={template.isBuiltin ? 'secondary' : 'outline'}
            className="shrink-0 text-xs"
          >
            {template.isBuiltin ? 'Built-in' : 'Custom'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        {isActive && (
          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 size={11} />
            <span>Active on new tab</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {isActive ? (
          <Button size="sm" variant="secondary" className="flex-1 text-xs pointer-events-none shadow-none active:translate-y-0">
            <CheckCircle2 size={11} className="mr-1" />
            Active
          </Button>
        ) : (
          <Button size="sm" className="flex-1 text-xs active:translate-y-0" onClick={onActivate}>
            <Zap size={11} className="mr-1" />
            Activate
          </Button>
        )}
        {!template.isBuiltin && onDelete && (
          <Button size="sm" variant="destructive" onClick={onDelete} className="px-2.5 active:translate-y-0">
            <Trash2 size={11} />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const [dark, setDark] = useDarkMode()
  const [activeId, setActiveId] = useState('')
  const [userList, setUserList] = useState<Template[]>([])
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const builtins = getBuiltinTemplates()

  useEffect(() => {
    Promise.all([
      activeTemplateId.getValue(),
      userTemplates.getValue(),
    ]).then(([id, saved]) => {
      setUserList(saved)
      if (!id && builtins.length > 0) {
        doActivate(builtins[0])
      } else {
        setActiveId(id)
      }
    })
  }, [])

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
    showStatus(`"${template.name}" is now your new tab.`, true)
  }

  async function doDelete(id: string) {
    const updated = userList.filter((t) => t.id !== id)
    await userTemplates.setValue(updated)
    setUserList(updated)
    if (activeId === id) {
      await Promise.all([
        activeTemplateId.setValue(''),
        activeTemplateHtml.setValue(''),
      ])
      setActiveId('')
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
      const raw = ev.target?.result as string
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
    }

    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ── */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-base font-semibold tracking-tight">Write Your Newtab</span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDark(!dark)}
              className="px-2"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </Button>
            {/* <Button size="sm" onClick={() => fileRef.current?.click()}>
              <Upload size={13} className="mr-1.5" />
              Upload HTML
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".html"
              className="hidden"
              onChange={handleFile}
            /> */}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Built-in templates */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Built-in
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

        {/* User uploads */}
        {/* {userList.length > 0 ? (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Your uploads
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-xl py-10 text-muted-foreground text-sm hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer bg-transparent"
          >
            <Upload size={18} className="mx-auto mb-2 opacity-40" />
            <p>Upload your own HTML file</p>
            <p className="text-xs mt-1 opacity-60">Scripts are sanitized for safety</p>
          </button>
        )} */}

      </main>

      {/* ── Status toast ── */}
      {status && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className={cn(
            'rounded-lg border px-4 py-2.5 text-sm shadow-lg backdrop-blur-sm whitespace-nowrap',
            status.ok
              ? 'border-green-500/25 bg-green-500/10 text-green-700 dark:text-green-400'
              : 'border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400'
          )}>
            {status.msg}
          </div>
        </div>
      )}

    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Dashboard />)