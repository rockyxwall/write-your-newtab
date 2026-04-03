const builtinFiles = import.meta.glob<string>('../builtins/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export interface Template {
  id: string
  name: string
  html: string
  isBuiltin: boolean
  uploadedAt?: string
}

function filenameToName(filename: string): string {
  return filename
    .replace(/\.html$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function getBuiltinTemplates(): Template[] {
  return Object.entries(builtinFiles).map(([path, html]) => {
    const filename = path.split('/').pop() ?? 'template.html'
    return {
      id: `builtin-${filename.replace(/\.html$/, '')}`,
      name: filenameToName(filename),
      html,
      isBuiltin: true,
    }
  })
}