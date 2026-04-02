import { useEffect, useRef, useState } from 'react'
import { Upload, CheckCircle2, Trash2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { getBuiltinTemplates, type Template } from '@/lib/templates'
import { activeTemplateHtml, activeTemplateId, userTemplates } from '@/lib/storage'
import { sanitizeHtml } from '@/lib/sanitize'

export default function App() {
  const [activeId, setActiveId] = useState<string>('')
  const [userList, setUserList] = useState<Template[]>([])
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const builtins = getBuiltinTemplates()

  // Load saved state on mount
  useEffect(() => {
    Promise.all([activeTemplateId.getValue(), userTemplates.getValue()]).then(
      ([id, saved]) => {
        // First run: auto-activate the first builtin so new tab isn't blank
        if (!id && builtins.length > 0) {
          activate(builtins[0])
        } else {
          setActiveId(id)
        }
        setUserList(saved)
      }
    )
  }, [])

  function showStatus(msg: string, ok: boolean) {
    setStatus({ msg, ok })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setStatus(null), 3500)
  }

  async function activate(template: Template) {
    await Promise.all([
      activeTemplateId.setValue(template.id),
      activeTemplateHtml.setValue(template.html),
    ])
    setActiveId(template.id)
    showStatus(`"${template.name}" is now your new tab.`, true)
  }

  async function deleteTemplate(id: string) {
    const updated = userList.filter((t) => t.id !== id)
    await userTemplates.setValue(updated)
    setUserList(updated)

    // If we deleted the active template, clear it
    if (activeId === id) {
      await Promise.all([
        activeTemplateId.setValue(''),
        activeTemplateHtml.setValue(''),
      ])
      setActiveId('')
    }
    showStatus('Template deleted.', true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.html')) {
      showStatus('Please upload a .html file.', false)
      return
    }

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string
      // Sanitize before storing — removes <script>, on* attributes, etc.
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
      await activate(newTemplate)
      showStatus(`"${newTemplate.name}" uploaded and activated.`, true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function TemplateCard({ template }: { template: Template }) {
    const isActive = template.id === activeId
    return (
      <Card className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-medium truncate">{template.name}</CardTitle>
            <Badge variant={template.isBuiltin ? 'secondary' : 'outline'} className="shrink-0 text-xs">
              {template.isBuiltin ? 'Built-in' : 'Custom'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          {isActive && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <CheckCircle2 size={12} />
              <span>Active</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="gap-2 pt-0">
          {isActive ? (
            <Button size="sm" variant="secondary" disabled className="flex-1">
              Active
            </Button>
          ) : (
            <Button size="sm" className="flex-1" onClick={() => activate(template)}>
              <Zap size={12} className="mr-1" />
              Activate
            </Button>
          )}
          {!template.isBuiltin && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteTemplate(template.id)}
            >
              <Trash2 size={12} />
            </Button>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-base font-semibold tracking-tight">Write Your Newtab</h1>
          <Button size="sm" onClick={() => fileRef.current?.click()}>
            <Upload size={13} className="mr-1.5" />
            Upload HTML
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".html"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Status toast */}
        {status && (
          <div className={`text-sm px-4 py-2.5 rounded-lg border ${
            status.ok
              ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
              : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
          }`}>
            {status.msg}
          </div>
        )}

        {/* Built-in templates */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Built-in
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {builtins.map((t) => <TemplateCard key={t.id} template={t} />)}
          </div>
        </section>

        {/* User templates */}
        {userList.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Your uploads
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {userList.map((t) => <TemplateCard key={t.id} template={t} />)}
            </div>
          </section>
        )}

        {/* Empty upload state */}
        {userList.length === 0 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-border rounded-xl py-10 text-muted-foreground text-sm hover:border-primary/50 hover:text-foreground transition-colors"
          >
            <Upload size={20} className="mx-auto mb-2 opacity-50" />
            Upload your own HTML file
          </button>
        )}

      </main>
    </div>
  )
}