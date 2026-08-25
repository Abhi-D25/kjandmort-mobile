'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Plus, X } from 'lucide-react'
import { ITEM_CATEGORIES, normalizeItems } from '@/lib/items'

// Controlled input for categorized "items devoured".
// value: { appetizers: [], entrees: [], drinks: [], dessert: [] }
export default function ItemsInput({ value, onChange }) {
  const items = normalizeItems(value)
  const [drafts, setDrafts] = useState({})

  const addItem = (key) => {
    const draft = (drafts[key] || '').trim()
    if (!draft) return
    onChange({ ...items, [key]: [...items[key], draft] })
    setDrafts(prev => ({ ...prev, [key]: '' }))
  }

  const removeItem = (key, index) => {
    onChange({ ...items, [key]: items[key].filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-2">
      {ITEM_CATEGORIES.map(({ key, label, emoji }) => (
        <div key={key} className="space-y-1">
          <Label htmlFor={`items-${key}`} className="text-xs text-gray-600">
            {emoji} {label}
          </Label>
          {items[key].length > 0 && (
            <div className="flex flex-wrap gap-1">
              {items[key].map((item, index) => (
                <Badge
                  key={`${item}-${index}`}
                  variant="secondary"
                  className="gap-1 pr-1 font-normal"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem(key, index)}
                    className="rounded-full p-0.5 hover:bg-gray-300/60 transition-colors"
                    aria-label={`Remove ${item}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-1">
            <Input
              id={`items-${key}`}
              value={drafts[key] || ''}
              onChange={(e) => setDrafts(prev => ({ ...prev, [key]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addItem(key)
                }
              }}
              placeholder={`Add ${label.toLowerCase().replace(/s$/, '')}...`}
              className="h-8 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addItem(key)}
              disabled={!(drafts[key] || '').trim()}
              className="h-8 w-8 p-0 shrink-0"
              aria-label={`Add ${label.toLowerCase()}`}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      <p className="text-xs text-gray-500">All optional — leave anything blank</p>
    </div>
  )
}
