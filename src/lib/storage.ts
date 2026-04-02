// WXT's storage.defineItem wraps chrome.storage.local with TypeScript types
// and default values. Much cleaner than raw chrome.storage calls.
import { storage } from '@wxt-dev/storage';
import type { Template } from './templates'

// Which template is currently active (its id string)
export const activeTemplateId = storage.defineItem<string>(
  'local:activeTemplateId',
  { defaultValue: '' }
)

// The full HTML of the active template, stored separately so newtab.html
// can render it in ONE storage read without knowing which template it came from.
export const activeTemplateHtml = storage.defineItem<string>(
  'local:activeTemplateHtml',
  { defaultValue: '' }
)

// Array of user-uploaded templates
export const userTemplates = storage.defineItem<Template[]>(
  'local:userTemplates',
  { defaultValue: [] }
)