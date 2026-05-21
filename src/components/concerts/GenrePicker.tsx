'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { GENRES_PAR_CATEGORIE } from '@/lib/types'

interface GenrePickerProps {
  selected: string[]
  onChange: (genres: string[]) => void
}

export default function GenrePicker({ selected, onChange }: GenrePickerProps) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (genre: string) => {
    if (selected.includes(genre)) onChange(selected.filter(g => g !== genre))
    else onChange([...selected, genre])
  }

  const toggleCategorie = (cat: string) =>
    setExpanded(prev => prev === cat ? null : cat)

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-1">
          {selected.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => toggle(g)}
              className="flex items-center gap-1.5 bg-fosse-orange/15 border border-fosse-orange/40 text-fosse-orange text-xs font-bold rounded-full px-3 py-1.5 hover:bg-fosse-orange/25 transition-colors"
            >
              {g}
              <span className="text-[10px] opacity-70 ml-0.5">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Categories */}
      <div className="space-y-1.5">
        {GENRES_PAR_CATEGORIE.map(({ categorie, genres }) => (
          <div key={categorie} className="border border-fosse-border rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCategorie(categorie)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-fosse-card hover:bg-fosse-surface transition-colors text-sm font-bold text-fosse-muted hover:text-white"
            >
              <span className="flex items-center gap-2">
                {categorie}
                {genres.filter(g => selected.includes(g)).length > 0 && (
                  <span className="bg-fosse-orange text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {genres.filter(g => selected.includes(g)).length}
                  </span>
                )}
              </span>
              {expanded === categorie
                ? <ChevronUp className="w-3.5 h-3.5" />
                : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expanded === categorie && (
              <div className="p-3 bg-fosse-surface border-t border-fosse-border flex flex-wrap gap-2">
                {genres.map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggle(g)}
                    className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
                      selected.includes(g)
                        ? 'bg-fosse-orange/15 border-fosse-orange/50 text-fosse-orange'
                        : 'bg-fosse-card border-fosse-border text-fosse-muted hover:border-fosse-muted hover:text-white'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
