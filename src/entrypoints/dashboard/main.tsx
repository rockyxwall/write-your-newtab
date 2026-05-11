import { createRoot } from 'react-dom/client'
import { useEffect, useRef, useState } from 'react'
import {
  Moon, Sun, Upload,
  CheckCircle2, Sparkles,
  Download, FileUp, X,
  Code2, Save, ArrowLeft, Plus,
  Library, Settings, ShieldCheck, Info, Monitor, Eye
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getBuiltinTemplates, type Template } from '@/lib/templates'
import { activeTemplateHtml, activeTemplateId, userTemplates } from '@/lib/storage'
import { sanitizeHtml } from '@/lib/sanitize'
import { Editor } from '@/components/Editor'
import { TemplateCard } from '@/components/TemplateCard'

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
    const exists = userList.some(t => t.id === editingTemplate.id)
    
    let updated: Template[]
    if (exists) {
      updated = userList.map(t => 
        t.id === editingTemplate.id ? { ...t, html: sanitized } : t
      )
    } else {
      updated = [...userList, { ...editingTemplate, html: sanitized }]
    }
    
    await userTemplates.setValue(updated)
    setUserList(updated)
    
    // If we're editing the active template, update the active HTML too
    if (activeId === editingTemplate.id) {
      await activeTemplateHtml.setValue(sanitized)
    }
    
    setEditingTemplate(null)
    showStatus('Changes saved.', true)
  }

  async function handleCreateBlank() {
    const starterHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Template</title>
  <style>
    :root {
      --bg: #0a0a0a;
      --fg: #ffffff;
      --accent: #3b82f6;
    }
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      color: var(--fg);
      font-family: system-ui, -apple-system, sans-serif;
      text-align: center;
    }
    .container {
      padding: 2rem;
      border-radius: 2rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }
    h1 {
      font-size: 4rem;
      font-weight: 900;
      letter-spacing: -0.05em;
      margin: 0;
      background: linear-gradient(to bottom right, #fff, #666);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
    }
    .accent { color: var(--accent); }
  </style>
</head>
<body>
  <div class="container">
    <h1>WYN<span class="accent">Tab</span></h1>
    <p>Your journey begins here</p>
  </div>
</body>
</html>`

    const newTemplate: Template = {
      id: `user-${Date.now()}`,
      name: 'Untitled Template',
      html: starterHtml,
      isBuiltin: false,
      uploadedAt: new Date().toISOString(),
    }

    setEditingTemplate(newTemplate)
    setEditorValue(starterHtml)
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
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl">
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
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black tracking-tighter italic leading-none">WYNTab</span>
                <span className="text-[10px] font-black text-primary/50 italic leading-none">v{browser.runtime.getManifest().version}</span>
              </div>
              <span className="text-[9px] font-black text-muted-foreground/40 leading-none mt-1 uppercase tracking-widest">Dashboard</span>
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
              Custom Library
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
                {activeTab === 'built-in' ? 'Built-in Gallery' : activeTab === 'custom' ? 'Custom Library' : 'System Settings'}
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
                <div className="h-20 w-20 bg-muted/50 rounded-3xl bg-muted/30 border border-border flex items-center justify-center mb-6 border border-border">
                  <Upload size={32} className="text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic mb-2">Empty Library</h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-8">
                  Upload or create your first HTML template to start personalizing your experience beyond the built-in gallery.
                  <br />
                  <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wider mt-2 block">Note: Scripts are disabled for security.</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button 
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Plus size={16} />
                    Upload HTML
                  </button>
                  <button 
                    onClick={handleCreateBlank}
                    className="inline-flex items-center gap-3 bg-muted text-foreground px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-border transition-all border border-border"
                  >
                    <Code2 size={16} />
                    Create Live
                  </button>
                </div>
              </div>
            )
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl animate-in fade-in slide-in-from-left-4 duration-500">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">System Information</h3>
                     <div className="grid gap-2">
                        <div className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-border">
                           <div className="flex items-center gap-3">
                              <Info size={16} className="text-muted-foreground" />
                              <span className="text-[11px] font-bold uppercase tracking-wider">Version</span>
                           </div>
                           <span className="text-[11px] font-black font-mono text-primary">{browser.runtime.getManifest().version}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-3xl bg-muted/30 border border-border">
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
                           <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
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
                      className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                      Activate Template
                    </button>
                    <button 
                      onClick={() => setPreviewTemplate(null)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-border transition-all"
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
            'rounded-2xl border px-8 py-4 text-[11px] font-black uppercase tracking-widest shadow-2xl backdrop-blur-2xl whitespace-nowrap flex items-center gap-3', 
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