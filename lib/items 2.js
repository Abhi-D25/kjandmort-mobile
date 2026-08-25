// Categorized "items devoured" helpers. Stored in restaurants.items (jsonb)
// as { appetizers: [], entrees: [], drinks: [], dessert: [] }; legacy entries
// keep their free text in restaurants.items_devoured instead.

export const ITEM_CATEGORIES = [
  { key: 'appetizers', label: 'Appetizers', emoji: '🥟' },
  { key: 'entrees', label: 'Entrees', emoji: '🍛' },
  { key: 'drinks', label: 'Drinks', emoji: '🥤' },
  { key: 'dessert', label: 'Dessert', emoji: '🍰' }
]

export function emptyItems() {
  return { appetizers: [], entrees: [], drinks: [], dessert: [] }
}

// Normalize whatever is stored into the canonical shape (null → empty lists)
export function normalizeItems(items) {
  const base = emptyItems()
  if (!items || typeof items !== 'object') return base
  for (const { key } of ITEM_CATEGORIES) {
    if (Array.isArray(items[key])) {
      base[key] = items[key].filter(i => typeof i === 'string' && i.trim() !== '')
    }
  }
  return base
}

export function hasItems(items) {
  if (!items || typeof items !== 'object') return false
  return ITEM_CATEGORIES.some(({ key }) => Array.isArray(items[key]) && items[key].length > 0)
}

// Server-side validation of an incoming items payload. Returns null for
// empty/absent input, the cleaned object otherwise, or throws on bad shape.
export function sanitizeItems(items) {
  if (items === undefined || items === null) return null
  if (typeof items !== 'object' || Array.isArray(items)) {
    throw new Error('items must be an object of category arrays')
  }
  const cleaned = {}
  let any = false
  for (const { key } of ITEM_CATEGORIES) {
    const list = items[key]
    if (list === undefined || list === null) {
      cleaned[key] = []
      continue
    }
    if (!Array.isArray(list) || list.some(i => typeof i !== 'string')) {
      throw new Error(`items.${key} must be an array of strings`)
    }
    cleaned[key] = list.map(i => i.trim()).filter(Boolean)
    if (cleaned[key].length > 0) any = true
  }
  return any ? cleaned : null
}
