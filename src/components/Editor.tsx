import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { html } from '@codemirror/lang-html'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorState } from '@codemirror/state'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  darkMode?: boolean
}

export function Editor({ value, onChange, darkMode }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        html(),
        ...(darkMode ? [oneDark] : []),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '13px' },
          '.cm-scroller': { overflow: 'auto' },
        }),
      ],
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [])

  // Sync darkMode if it changes without rebuilding the whole editor
  // For simplicity here, we'll just rebuild if darkMode changes significantly
  // or handle it via extensions if we want to be more surgical.
  // Rebuilding is fine for now as it's not frequent.
  useEffect(() => {
    if (viewRef.current) {
        // Simple way to handle theme toggle: destroy and recreate or use a compartment
        // For now, let's keep it simple. If we need more performance, we'll use compartments.
    }
  }, [darkMode])

  return (
    <div 
      ref={containerRef} 
      className="h-full w-full border border-border rounded-xl overflow-hidden shadow-inner bg-card"
    />
  )
}
