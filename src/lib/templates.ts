// import.meta.glob is a Vite feature that reads all matching files at build time.
// `as: 'raw'` means: import the FILE CONTENTS as a plain string (not as a module).
// `eager: true` means: load everything immediately, not lazily.
// The result: every .html file in src/builtins/ becomes a key-value pair:
//   { '../builtins/clock.html': '<html>...</html>', ... }
// ADD A NEW .html FILE → it automatically appears in the dashboard. Zero config.
const builtinFiles = import.meta.glob<string>('../builtins/*.html', {
  as: 'raw',
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