import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import {
  Moon, Sun, Upload, Trash2, Zap,
  CheckCircle2, LayoutGrid, Sparkles,
  Download, FileUp, Copy, Pencil, Check, X,
  Code2, Save, ArrowLeft, Menu, Plus, ChevronDown,
  Library, Settings, ShieldCheck, Info, Monitor, Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getBuiltinTemplates, type Template } from '@/lib/templates'
import { activeTemplateHtml, activeTemplateId, userTemplates } from '@/lib/storage'
import { sanitizeHtml } from '@/lib/sanitize'
import { Editor } from '@/components/Editor'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'built-in' | 'custom' | 'settings'

interface BackupData {
  version: number
  userTemplates: Template[]
  activeTemplateId: string
}

// ─── Dark mode hook ───────────────────────────────────────────────────────────
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
function TemplateCard({
  template,
  isActive,
  onActivate,
  onDelete,
  onRename,
  onDuplicate,
  onEditCode,
  onPreview,
}: {
  template: Template
  isActive: boolean
  onActivate: () => void
  onDelete?: () => void
  onRename?: (newName: string) => void
  onDuplicate: () => void
  onEditCode: () => void
  onPreview: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(template.name)

  const handleRename = () => {
    if (editName.trim() && editName !== template.name && onRename) {
      onRename(editName.trim())
    }
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground transition-all duration-500',
        'hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1',
        isActive && 'border-primary/50 ring-1 ring-primary/20 shadow-xl shadow-primary/5'
      )}
    >
      <div className="relative aspect-video overflow-hidden">
        <Preview html={template.html} />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20">
           <button 
             onClick={(e) => { e.stopPropagation(); onPreview(); }}
             className="h-9 w-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all scale-90 group-hover:scale-100"
             title="Large Preview"
           >
             <Eye size={18} />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onActivate(); }}
             className="h-9 w-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all scale-90 group-hover:scale-100"
             title="Activate"
           >
             <Zap size={18} fill="currentColor" />
           </button>
        </div>
      </div>

      {/* Title + Badge */}
      <div className="p-4 pb-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
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
                className="w-full bg-muted border border-primary/30 rounded-lg px-2 py-1 text-[11px] font-bold outline-none"
              />
              <button onClick={handleRename} className="text-green-500 hover:text-green-600 transition-colors">
                <Check size={14} />
              </button>
              <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-600 transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 truncate flex-1 group/name">
              <h3 className="truncate text-xs font-bold leading-tight uppercase tracking-tight text-foreground/80">
                {template.name}
              </h3>
              {!template.isBuiltin && onRename && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                  className="opacity-0 group-hover/name:opacity-100 p-1 hover:bg-muted rounded-md transition-all"
                >
                  <Pencil size={10} className="text-muted-foreground" />
                </button>
              )}
            </div>
          )}
          <span
            className={cn(
              'shrink-0 inline-flex items-center justify-center rounded-full border px-2 py-0.5 h-4 text-[8px] font-black uppercase tracking-widest transition-colors',
              template.isBuiltin
                ? 'bg-secondary/50 text-secondary-foreground border-transparent'
                : 'border-border text-foreground/60'
            )}
          >
            {template.isBuiltin ? 'Built-in' : 'Custom'}
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 mt-auto flex items-center justify-between border-t border-border/50 bg-muted/10">
        {isActive ? (
          <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-widest">
            <ShieldCheck size={12} strokeWidth={2.5} />
            <span>Active</span>
          </div>
        ) : (
          <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
             {template.isBuiltin ? 'Ready to use' : 'User Template'}
          </div>
        )}
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
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────
function Dashboard() {
  const [dark, setDark] = useDarkMode()
  const [activeId, setActiveId] = useState('')
  const [userList, setUserList] = useState<Template[]>([])
  const [status, setStatus] = useState<{ msg: string; ok: boolean } | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editorValue, setEditorValue] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('built-in')
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  
  const fileRef = useRef<HTMLInputElement>(null)
  const backupRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const builtins = getBuiltinTemplates()

  useEffect(() => {
    refreshData()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
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
    if (!confirm('Are you sure you want to delete this template?')) return
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

  async function doRename(id: string, newName: string) {
    const updated = userList.map(t => t.id === id ? { ...t, name: newName } : t)
    await userTemplates.setValue(updated)
    setUserList(updated)
    showStatus('Template renamed.', true)
  }

  async function doDuplicate(template: Template) {
    const newTemplate: Template = {
      ...template,
      id: `user-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isBuiltin: false,
      uploadedAt: new Date().toISOString(),
    }
    const updated = [...userList, newTemplate]
    await userTemplates.setValue(updated)
    setUserList(updated)
    showStatus(`Duplicated "${template.name}".`, true)
  }

  async function doSaveCode() {
    if (!editingTemplate) return
    
    const sanitized = sanitizeHtml(editorValue)
    const updated = userList.map(t => 
      t.id === editingTemplate.id ? { ...t, html: sanitized } : t
    )
    
    await userTemplates.setValue(updated)
    setUserList(updated)
    
    // If we're editing the active template, update the active HTML too
    if (activeId === editingTemplate.id) {
      await activeTemplateHtml.setValue(sanitized)
    }
    
    setEditingTemplate(null)
    showStatus('Changes saved.', true)
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
        setActiveTab('custom')
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
        setActiveTab('custom')
        showStatus('Backup imported successfully.', true)
      } catch (err) {
        showStatus('Failed to import backup. Invalid file.', false)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ─── Editor View ────────────────────────────────────────────────────────────
  if (editingTemplate) {
    return (
      <div className={cn("h-screen bg-background text-foreground flex flex-col transition-colors duration-300 font-sans", dark && "dark")}>
        <header className="border-b border-border h-16 flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
             <button 
              onClick={() => setEditingTemplate(null)}
              className="h-10 w-10 flex items-center justify-center hover:bg-muted rounded-full transition-all border border-border"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">Editor Mode</span>
              <span className="text-sm font-bold truncate max-w-[200px]">{editingTemplate.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 mr-2">
               <ShieldCheck size={14} />
               <span className="text-[10px] font-bold uppercase tracking-wider">Scripts Disabled (CSP)</span>
            </div>
            <button 
              onClick={() => setEditingTemplate(null)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-background h-10 px-5 text-[11px] font-bold uppercase tracking-wider hover:bg-muted transition-all"
            >
              Discard
            </button>
            <button 
              onClick={doSaveCode}
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground h-10 px-6 text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </button>
          </div>
        </header>
        <main className="flex-grow flex overflow-hidden bg-muted/20">
          <div className="flex-1 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
               <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Code2 size={14} className="text-primary" /> Source HTML
               </h2>
               <div className="text-[10px] font-medium text-muted-foreground/60 italic">Live editing enabled</div>
            </div>
            <div className="flex-grow overflow-hidden rounded-2xl border border-border shadow-inner">
               <Editor value={editingTemplate.html} onChange={setEditorValue} darkMode={dark} />
            </div>
          </div>
          <div className="flex-1 border-l border-border flex flex-col p-6 overflow-hidden">
             <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
               <Sparkles size={14} className="text-primary" /> Live Preview
             </h2>
             <div className="flex-grow bg-white rounded-2xl border border-border overflow-hidden shadow-2xl relative">
                <iframe 
                  srcDoc={editorValue} 
                  className="absolute inset-0 w-full h-full border-none"
                  title="Live Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
             </div>
          </div>
        </main>
      </div>
    )
  }

  // ─── Dashboard View ─────────────────────────────────────────────────────────
  return (
    <div className={cn("h-screen bg-background text-foreground transition-colors duration-500 font-sans flex overflow-hidden selection:bg-primary/20", dark && "dark")}>
      <input type="file" ref={fileRef} className="hidden" accept=".html" onChange={handleFile} />
      <input type="file" ref={backupRef} className="hidden" accept=".json" onChange={handleImport} />

      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col shrink-0 bg-muted/20 backdrop-blur-xl">
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-10">
            <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/20">
              <img src="/icon/128.png" className="w-5 h-5 invert-0 brightness-0 invert" alt="WYNTab" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter italic leading-none">WYNTab</span>
              <span className="text-[9px] font-black text-muted-foreground/40 leading-none mt-1">DASHBOARD v{browser.runtime.getManifest().version}</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('built-in')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'built-in' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Library size={16} />
              Built-in Gallery
            </button>
            <button 
              onClick={() => setActiveTab('custom')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'custom' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Upload size={16} />
              Your Uploads
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                activeTab === 'settings' ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Settings size={16} />
              Settings
            </button>
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
           <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-full inline-flex items-center justify-between rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-[10px] h-12 px-5 shadow-xl transition-all hover:opacity-90 active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <Plus size={14} />
                  <span>New Template</span>
                </div>
                <ChevronDown size={14} className={cn("transition-transform duration-300", showMenu && "rotate-180")} />
              </button>

              {showMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-border bg-card text-card-foreground shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="p-1.5">
                    <button
                      onClick={() => { setShowMenu(false); fileRef.current?.click(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent hover:text-accent-foreground transition-all text-left"
                    >
                      <Upload size={14} className="text-primary" />
                      Upload HTML
                    </button>
                    <div className="h-px bg-border/50 my-1" />
                    <button
                      onClick={() => { setShowMenu(false); backupRef.current?.click(); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-accent hover:text-accent-foreground transition-all text-left"
                    >
                      <FileUp size={14} className="text-primary" />
                      Import JSON
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-2">
               <button 
                onClick={() => setDark(!dark)} 
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-background transition-all hover:bg-accent hover:border-accent"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="flex flex-col items-end">
                 <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Theme</span>
                 <span className="text-[10px] font-bold">{dark ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background/50 backdrop-blur-md z-10 shrink-0">
           <div className="flex items-center gap-3">
              {activeTab === 'built-in' && <Library size={18} className="text-primary" />}
              {activeTab === 'custom' && <Upload size={18} className="text-primary" />}
              {activeTab === 'settings' && <Settings size={18} className="text-primary" />}
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
                {activeTab === 'built-in' ? 'Built-in Gallery' : activeTab === 'custom' ? 'Your Custom Library' : 'System Settings'}
              </h2>
           </div>
           {activeTab === 'custom' && userList.length > 0 && (
              <button 
                onClick={handleExport}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-border hover:bg-muted transition-all"
              >
                <Download size={14} />
                Export Backup
              </button>
           )}
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'built-in' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {builtins.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  isActive={t.id === activeId}
                  onActivate={() => doActivate(t)}
                  onDuplicate={() => doDuplicate(t)}
                  onPreview={() => setPreviewTemplate(t)}
                  onEditCode={() => {
                     doDuplicate(t).then(() => showStatus('Duplicated for editing.', true))
                  }}
                />
              ))}
            </div>
          )}

          {activeTab === 'custom' && (
            userList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {userList.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    isActive={t.id === activeId}
                    onActivate={() => doActivate(t)}
                    onDelete={() => doDelete(t.id)}
                    onRename={(name) => doRename(t.id, name)}
                    onDuplicate={() => doDuplicate(t)}
                    onPreview={() => setPreviewTemplate(t)}
                    onEditCode={() => {
                      setEditingTemplate(t)
                      setEditorValue(t.html)
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-in fade-in zoom-in duration-500">
                <div className="h-20 w-20 bg-muted/50 rounded-3xl flex items-center justify-center mb-6 border border-border">
                  <Upload size={32} className="text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic mb-2">No Custom Templates</h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-8">
                  Upload your first HTML template to start personalizing your experience beyond the built-in gallery.
                  <br />
                  <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider mt-2 block">Note: Scripts are disabled for security.</span>
                </p>
                <button 
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus size={16} />
                  Upload HTML
                </button>
              </div>
            )
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">System Information</h3>
                     <div className="grid gap-2">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                           <div className="flex items-center gap-3">
                              <Info size={16} className="text-muted-foreground" />
                              <span className="text-[11px] font-bold uppercase tracking-wider">Version</span>
                           </div>
                           <span className="text-[11px] font-black font-mono text-primary">{browser.runtime.getManifest().version}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border">
                           <div className="flex items-center gap-3">
                              <Monitor size={16} className="text-muted-foreground" />
                              <span className="text-[11px] font-bold uppercase tracking-wider">Platform</span>
                           </div>
                           <span className="text-[11px] font-black font-mono text-primary">Web Extension</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Security & Scripting</h3>
                     <div className="p-6 rounded-3xl bg-muted/30 border border-border">
                        <div className="flex items-start gap-4">
                           <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
                              <ShieldCheck size={20} />
                           </div>
                           <div className="space-y-2">
                              <h4 className="text-xs font-black uppercase tracking-wider">Scripts are Disabled</h4>
                              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                                 Due to browser extension security policies (CSP), all <code>&lt;script&gt;</code> tags are automatically removed. Your templates should rely strictly on HTML and CSS.
                              </p>
                              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                                 We are working on a secure <strong>Widget API</strong> for future releases to bring back dynamic elements like clocks and weather safely.
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Data Management</h3>
                     <div className="p-6 rounded-3xl bg-muted/30 border border-border">
                        <p className="text-xs text-muted-foreground font-medium mb-6 leading-relaxed">
                           Your data is stored locally in your browser. You can export a backup of all your custom templates to move them to another machine.
                        </p>
                        <div className="flex flex-wrap gap-3">
                           <button 
                            onClick={handleExport}
                            className="inline-flex items-center gap-2 bg-foreground text-background px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                           >
                              <Download size={14} />
                              Export Backup
                           </button>
                           <button 
                            onClick={() => backupRef.current?.click()}
                            className="inline-flex items-center gap-2 bg-muted text-foreground px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-border transition-all border border-border"
                           >
                              <FileUp size={14} />
                              Import JSON
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Large Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setPreviewTemplate(null)} />
           <div className="relative w-full max-w-6xl aspect-video bg-white rounded-2xl shadow-2xl overflow-hidden border border-border/50 flex flex-col scale-in animate-in zoom-in-95 duration-300">
              <header className="h-16 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl border-b border-border shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-primary/10 text-primary">
                       <Eye size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black uppercase tracking-tighter italic">{previewTemplate.name}</h3>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Large Preview Mode</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { doActivate(previewTemplate); setPreviewTemplate(null); }}
                      className="h-10 px-6 rounded-2xl bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                      Activate Template
                    </button>
                    <button 
                      onClick={() => setPreviewTemplate(null)}
                      className="h-10 w-10 flex items-center justify-center rounded-2xl bg-muted text-muted-foreground hover:bg-border transition-all"
                    >
                      <X size={20} />
                    </button>
                 </div>
              </header>
              <div className="flex-1 relative bg-white overflow-hidden">
                 <iframe 
                   srcDoc={`<style>html, body { overflow: hidden !important; pointer-events: none !important; cursor: default !important; user-select: none !important; }</style>${previewTemplate.html}`}
                   scrolling="no"
                   className="absolute inset-0 w-full h-full border-none pointer-events-none"
                   title="Large Preview"
                   sandbox="allow-scripts allow-same-origin allow-forms"
                 />
              </div>
           </div>
        </div>
      )}

      {status && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className={cn(
            'rounded-3xl border px-8 py-4 text-[11px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-2xl whitespace-nowrap flex items-center gap-3', 
            status.ok ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400' : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
          )}>
            {status.ok ? <CheckCircle2 size={16} /> : <X size={16} />}
            {status.msg}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── App Root ──────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(<Dashboard />)