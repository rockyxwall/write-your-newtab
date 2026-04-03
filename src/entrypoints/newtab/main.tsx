import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import { activeTemplateHtml } from '@/lib/storage'

function NewTab() {
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    activeTemplateHtml.getValue().then((stored) => {
      setHtml(stored || null)
      setLoading(false)
    })
  }, [])

  if (loading) return null

  if (!html) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#111',
        color: '#555',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.2rem', color: '#777' }}>Write Your Newtab</span>
        <span style={{ fontSize: '0.85rem' }}>Click the extension icon to pick a template.</span>
      </div>
    )
  }

  // srcdoc renders HTML directly in the iframe — works in extensions
  // unlike blob: URLs which are blocked by extension CSP
  return (
    <iframe
      srcDoc={html}
      style={{
        width: '100vw',
        height: '100vh',
        border: 'none',
        display: 'block',
      }}
      title="New tab"
      sandbox="allow-scripts allow-same-origin allow-forms"
    />
  )
}

const root = document.getElementById('root')!
createRoot(root).render(<NewTab />)