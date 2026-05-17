'use client'

import { useState } from 'react'
import { Loader2, Search, Music, MapPin, Calendar, CheckCircle2, X } from 'lucide-react'

interface SetlistResult {
  id: string
  eventDate: string
  venue: { name: string; city: { name: string; country: { name: string } } }
  artist: { name: string }
  sets: { set: { song: { name: string; cover?: { name: string } }[] }[] }
  url: string
}

interface Props {
  artist: string
  date: string
  venue: string
  onImport: (songs: string[], setlistId: string) => void
}

function formatDateFR(dateStr: string) {
  // dateStr is dd-MM-yyyy from setlist.fm
  const parts = dateStr.split('-')
  if (parts.length !== 3) return dateStr
  return `${parts[0]}/${parts[1]}/${parts[2]}`
}

function extractSongs(setlist: SetlistResult): string[] {
  const songs: string[] = []
  for (const set of setlist.sets.set ?? []) {
    for (const song of set.song ?? []) {
      if (song.name) songs.push(song.name)
    }
  }
  return songs
}

export default function SetlistSearch({ artist, date, venue, onImport }: Props) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<SetlistResult[] | null>(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [imported, setImported] = useState<string | null>(null)

  const canSearch = artist.trim().length > 0

  const search = async () => {
    if (!canSearch) return
    setLoading(true)
    setError('')
    setResults(null)
    setOpen(true)

    const params = new URLSearchParams({ artist: artist.trim() })
    if (date) params.set('date', date)
    if (venue.trim()) params.set('venue', venue.trim())

    try {
      const res = await fetch(`/api/setlistfm?${params}`)
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        const list: SetlistResult[] = data.setlist ?? []
        setResults(list)
        if (list.length === 0) setError('Aucune setlist trouvée pour ce concert.')
      }
    } catch {
      setError('Erreur lors de la recherche.')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = (setlist: SetlistResult) => {
    const songs = extractSongs(setlist)
    onImport(songs, setlist.id)
    setImported(setlist.id)
    setTimeout(() => setOpen(false), 800)
  }

  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={search}
        disabled={!canSearch || loading}
        className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border border-fosse-border bg-fosse-card text-fosse-muted hover:border-fosse-orange hover:text-fosse-orange transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
        Chercher sur Setlist.fm
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-fosse-border bg-[#0a0a0a] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-fosse-border">
            <span className="text-xs font-bold text-fosse-muted uppercase tracking-wider">Résultats Setlist.fm</span>
            <button type="button" onClick={() => setOpen(false)} className="text-fosse-border hover:text-fosse-muted transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8 gap-2 text-fosse-muted text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Recherche en cours…
              </div>
            )}

            {error && !loading && (
              <p className="text-sm text-fosse-muted text-center py-6 px-4">{error}</p>
            )}

            {results && results.length > 0 && !loading && results.map((s) => {
              const songs = extractSongs(s)
              const isImported = imported === s.id
              return (
                <div key={s.id} className="border-b border-[#111] last:border-0 px-4 py-3 hover:bg-fosse-card/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Infos concert */}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-fosse-muted mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{formatDateFR(s.eventDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{s.venue.name} — {s.venue.city.name}
                        </span>
                      </div>
                      {/* Aperçu setlist */}
                      {songs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {songs.slice(0, 6).map((song, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-fosse-card border border-fosse-border text-[#555]">
                              {song}
                            </span>
                          ))}
                          {songs.length > 6 && (
                            <span className="text-[10px] text-fosse-border">+{songs.length - 6} titres</span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-fosse-border italic">Setlist non publiée</p>
                      )}
                    </div>

                    {/* Bouton importer */}
                    {songs.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleImport(s)}
                        className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          isImported
                            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                            : 'bg-fosse-orange/10 border border-fosse-orange/20 text-fosse-orange hover:bg-fosse-orange/20'
                        }`}
                      >
                        {isImported
                          ? <><CheckCircle2 className="w-3.5 h-3.5" />Importé</>
                          : <><Music className="w-3.5 h-3.5" />{songs.length} titres</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
