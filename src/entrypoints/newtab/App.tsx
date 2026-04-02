import { useEffect, useMemo, useState } from 'react'
import { activeTemplateHtml } from '@/lib/storage'

export default function App() {
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    activeTemplateHtml.getValue().then((stored) => {
      setHtml(stored || null)
      setLoading(false)
    })
  }, [])

  // Create a blob URL from the stored HTML string.
  // An iframe with a blob URL runs scripts natively — no re-execution tricks needed.
  // useMemo ensures we only recreate the blob when the HTML actually changes.
  const blobUrl = useMemo(() => {
    if (!html) return null
    const blob = new Blob([html], { type: 'text/html' })
    return URL.createObjectURL(blob)
  }, [html])

  // Clean up the blob URL when the component unmounts or html changes
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  if (loading) return null

  if (!blobUrl) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#111', color: '#555', fontFamily: 'system-ui, sans-serif', textAlign: 'center', gap: '0.75rem'
      }}>
        <span style={{ fontSize: '1.2rem', color: '#777' }}>Write Your Newtab</span>
        <span style={{ fontSize: '0.85rem' }}>Click the extension icon to pick a template.</span>
      </div>
    )
  }

  return (
    <iframe
      src={blobUrl}
      style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }}
      title="Custom new tab"
    />
  )
}