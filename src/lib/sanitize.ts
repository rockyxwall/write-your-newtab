// Strips dangerous elements/attributes before storing user-uploaded HTML.
// Required for Chrome Web Store compliance.
const DANGEROUS_TAGS = ['script', 'object', 'embed', 'iframe', 'base', 'form']

export function sanitizeHtml(raw: string): string {
  const doc = new DOMParser().parseFromString(raw, 'text/html')

  DANGEROUS_TAGS.forEach((tag) =>
    doc.querySelectorAll(tag).forEach((el) => el.remove())
  )

  doc.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes)
      .map((a) => a.name)
      .forEach((name) => {
        if (
          name.startsWith('on') ||
          (el.getAttribute(name) ?? '').toLowerCase().trim().startsWith('javascript:')
        ) {
          el.removeAttribute(name)
        }
      })
  })

  return doc.body.innerHTML
}