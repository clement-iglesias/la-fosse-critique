'use client'

import { Trophy } from 'lucide-react'

interface SetlistTopPickerProps {
  songs: string[]          // parsed from setlist textarea
  topMorceaux: string[]    // max 3, ordered by selection
  onChange: (top: string[]) => void
}

const MEDALS = ['🥇', '🥈', '🥉']
const RANK_COLORS = [
  'border-yellow-400/50 bg-yellow-400/10 text-yellow-300',
  'border-slate-400/50 bg-slate-400/10 text-slate-300',
  'border-amber-600/50 bg-amber-600/10 text-amber-400',
]

export default function SetlistTopPicker({ songs, topMorceaux, onChange }: SetlistTopPickerProps) {
  if (songs.length === 0) return null

  const toggle = (song: string) => {
    if (topMorceaux.includes(song)) {
      onChange(topMorceaux.filter(s => s !== song))
    } else if (topMorceaux.length < 3) {
      onChange([...topMorceaux, song])
    }
  }

  const rankOf = (song: string) => topMorceaux.indexOf(song)

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-bold uppercase tracking-widest text-fosse-muted">
          Ton top 3
        </span>
        <span className="text-[10px] text-fosse-border ml-1">
          ({topMorceaux.length}/3 sélectionné{topMorceaux.length > 1 ? 's' : ''})
        </span>
      </div>

      {/* Songs list */}
      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {songs.map((song, i) => {
          const rank = rankOf(song)
          const isSelected = rank !== -1
          const isFull = topMorceaux.length >= 3 && !isSelected

          return (
            <button
              key={`${song}-${i}`}
              type="button"
              disabled={isFull}
              onClick={() => toggle(song)}
              className={[
                'w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-sm text-left transition-all',
                isSelected ? RANK_COLORS[rank] : '',
                !isSelected && !isFull
                  ? 'border-fosse-border bg-fosse-card text-fosse-muted hover:border-fosse-muted hover:text-white'
                  : '',
                isFull ? 'border-fosse-border bg-fosse-card text-fosse-border cursor-not-allowed opacity-40' : '',
              ].join(' ')}
            >
              {/* Rank or number */}
              <span className="shrink-0 w-6 text-center">
                {isSelected
                  ? <span className="text-base leading-none">{MEDALS[rank]}</span>
                  : <span className="text-[11px] text-fosse-border tabular-nums">{i + 1}</span>
                }
              </span>
              <span className={`flex-1 truncate font-medium ${isSelected ? 'font-bold' : ''}`}>
                {song}
              </span>
              {isSelected && (
                <span className="text-[10px] opacity-60 shrink-0">✕</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Current top summary */}
      {topMorceaux.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {topMorceaux.map((s, i) => (
            <span key={s} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${RANK_COLORS[i]}`}>
              {MEDALS[i]} {s}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
