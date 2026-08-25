'use client'

import { Badge } from '@/components/ui/badge'
import { ITEM_CATEGORIES, hasItems } from '@/lib/items'

// Read-only display for a visit's devoured items. New entries use the
// categorized `items` jsonb; older entries fall back to the free-text
// `items_devoured` field.
export default function ItemsDisplay({ items, legacyText }) {
  if (hasItems(items)) {
    return (
      <div className="space-y-1.5">
        {ITEM_CATEGORIES.filter(({ key }) => items[key]?.length > 0).map(({ key, label, emoji }) => (
          <div key={key} className="flex flex-wrap items-center gap-1">
            <span className="text-xs font-medium text-gray-500 mr-1">{emoji} {label}:</span>
            {items[key].map((item, index) => (
              <Badge key={`${item}-${index}`} variant="secondary" className="font-normal text-xs">
                {item}
              </Badge>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (legacyText) {
    return <p className="text-sm text-gray-600 break-words">{legacyText}</p>
  }

  return null
}
