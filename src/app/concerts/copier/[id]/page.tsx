'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HUMEURS_AVANT, HUMEURS_APRES, PLACEMENTS } from '@/lib/types'
import { Save, ArrowLeft, Loader2, Music, MapPin, Star, FileText, Clock, Users, Plus, X, Copy } from 'lucide-react'
import DatePicker from '@/components/ui/DatePicker'
import SetlistTopPicker from '@/components/concerts/SetlistTopPicker'
import FriendsTagger from '@/components/concerts/FriendsTagger'

export default function CopierConcertPage() {
  const router = useRouter()
  const params = useParams()
  const sourceId = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [moments, setMoments] = useState<string[]>([''])

  // Pre-filled from source (not editable or lightly editable)
  const [source, setSource] = useState<{
    artiste: string
    date_concert: string
    salle: string
    ville: string
    pays: string
    genres: string[]
    setlist: string[]
  } | null>(null)

  // Owned by this user
  const [avecQui, setAvecQui] = useState<string[]>([])
  const [topMorceaux, setTopMorceaux] = useState<string[]>([])
  const [form, setForm] = useState({
    note: '', journal: '',
    humeur_avant: '', humeur_apres: '', placement: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      // Load source concert
      const { data, error: err } = await supabase
        .from('concerts')
        .select('artiste, date_concert, salle, ville, pays, genres, genre, setlist, avec_qui')
        .eq('id', sourceId)
        .single()

      if (err || !data) { router.push('/dashboard'); return }

      setSource({
        artiste: data.artiste,
        date_concert: data.date_concert,
        salle: data.salle ?? '',
        ville: data.ville ?? '',
        pays: data.pays ?? 'France',
        genres: Array.isArray(data.genres) && data.genres.length > 0
          ? data.genres : (data.genre ? [data.genre] : []),
        setlist: Array.isArray(data.setlist) ? data.setlist : [],
      })

      // Pre-fill avec_qui from source
      if (data.avec_qui) {
        setAvecQui(data.avec_qui.split(',').map((s: string) => s.trim()).filter(Boolean))
      }

      setFetching(false)
    }
    load()
  }, [sourceId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const addMoment = () => setMoments(prev => [...prev, ''])
  const updateMoment = (i: number, v: string) => setMoments(prev => prev.map((m, idx) => idx === i ? v : m))
  const removeMoment = (i: number) => setMoments(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!source) return
    setLoading(true)
    setError('')

    const noteNum = form.note !== '' ? parseFloat(form.note) : null
    if (noteNum !== null && (noteNum < 0 || noteNum > 20)) {
      setError('La note doit être entre 0 et 20.'); setLoading(false); return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const momentsArr = moments.map(m => m.trim()).filter(Boolean)

      const { error: insertError } = await supabase.from('concerts').insert({
        user_id: user.id,
        artiste: source.artiste,
        date_concert: source.date_concert,
        salle: source.salle || null,
        ville: source.ville || null,
        pays: source.pays,
        genre: source.genres[0] || null,
        genres: source.genres,
        note: noteNum,
        journal: form.journal.trim() || null,
        humeur_avant: form.humeur_avant || null,
        humeur_apres: form.humeur_apres || null,
        avec_qui: avecQui.length > 0 ? avecQui.join(', ') : null,
        placement: form.placement || null,
        moments_cles: momentsArr,
        setlist: source.setlist,
        top_morceaux: topMorceaux,
        statut: 'vu',
      })

      if (insertError) throw insertError
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.")
    } finally {
      setLoading(false)
    }
  }

  const SectionTitle = ({ icon: Icon, label }: { icon: React.ElementType, label: string }) => (
    <div className="flex items-center gap-2 pt-6 pb-3 border-t border-fosse-border mt-6">
      <Icon className="w-4 h-4 text-fosse-orange" />
      <span className="text-xs font-bold uppercase tracking-widest text-fosse-muted">{label}</span>
    </div>
  )

  if (fetching) {
    return (
      <div className="min-h-screen bg-fosse-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-fosse-orange animate-spin" />
      </div>
    )
  }

  if (!source) return null

  return (
    <div className="min-h-screen bg-fosse-bg">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/notifications" className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black">Ajouter à ton journal</h1>
            <p className="text-fosse-muted text-sm">Tu étais là aussi — raconte ta version</p>
          </div>
        </div>

        {/* Concert recap (read-only) */}
        <div className="bg-fosse-surface border border-fosse-orange/20 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Copy className="w-3.5 h-3.5 text-fosse-orange" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-fosse-orange">Concert importé</span>
          </div>
          <h2 className="text-xl font-black text-white">{source.artiste}</h2>
          <p className="text-sm text-fosse-muted mt-1">
            {new Date(source.date_concert + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            {source.ville ? ` · ${source.ville}` : ''}
            {source.salle ? ` · ${source.salle}` : ''}
          </p>
          {source.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {source.genres.map(g => (
                <span key={g} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-fosse-card border border-fosse-border text-fosse-muted">
                  {g}
                </span>
              ))}
            </div>
          )}
          {source.setlist.length > 0 && (
            <p className="text-[10px] text-fosse-muted mt-2">
              ♫ Setlist importée · {source.setlist.length} titres
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Avec qui — pré-rempli, modifiable */}
          <div>
            <label className="block text-sm font-medium mb-2 text-fosse-muted">
              <Users className="w-3.5 h-3.5 inline mr-1" />Avec qui ?
            </label>
            <FriendsTagger selected={avecQui} onChange={setAvecQui} />
          </div>

          {/* Setlist top 3 */}
          {source.setlist.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 text-fosse-muted">Setlist importée</label>
              <SetlistTopPicker
                songs={source.setlist}
                topMorceaux={topMorceaux}
                onChange={setTopMorceaux}
              />
            </div>
          )}

          {/* Placement */}
          <SectionTitle icon={MapPin} label="Où étais-tu ?" />
          <div className="grid grid-cols-5 gap-2">
            {PLACEMENTS.map(p => (
              <button key={p.value} type="button"
                onClick={() => setForm(prev => ({ ...prev, placement: prev.placement === p.value ? '' : p.value }))}
                className={`flex flex-col items-center py-3 rounded-xl border text-xs font-semibold transition-all ${
                  form.placement === p.value
                    ? 'border-fosse-orange bg-fosse-orange/10 text-fosse-orange'
                    : 'border-fosse-border bg-fosse-card text-fosse-muted hover:border-fosse-muted'
                }`}>
                <span className="text-xl mb-1">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>

          {/* Humeurs */}
          <SectionTitle icon={Star} label="Comment tu te sentais ?" />
          <div>
            <label className="block text-sm font-medium mb-2 text-fosse-muted">Avant le concert</label>
            <div className="grid grid-cols-5 gap-2">
              {HUMEURS_AVANT.map(h => (
                <button key={h.label} type="button"
                  onClick={() => setForm(prev => ({ ...prev, humeur_avant: prev.humeur_avant === `${h.emoji} ${h.label}` ? '' : `${h.emoji} ${h.label}` }))}
                  className={`flex flex-col items-center py-2.5 rounded-xl border text-xs transition-all ${
                    form.humeur_avant === `${h.emoji} ${h.label}`
                      ? 'border-fosse-orange bg-fosse-orange/10'
                      : 'border-fosse-border bg-fosse-card text-fosse-muted hover:border-fosse-muted'
                  }`}>
                  <span className="text-2xl mb-0.5">{h.emoji}</span>
                  <span className="text-[10px]">{h.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-fosse-muted">Après le concert</label>
            <div className="grid grid-cols-6 gap-2">
              {HUMEURS_APRES.map(h => (
                <button key={h.label} type="button"
                  onClick={() => setForm(prev => ({ ...prev, humeur_apres: prev.humeur_apres === `${h.emoji} ${h.label}` ? '' : `${h.emoji} ${h.label}` }))}
                  className={`flex flex-col items-center py-2.5 rounded-xl border text-xs transition-all ${
                    form.humeur_apres === `${h.emoji} ${h.label}`
                      ? 'border-fosse-orange bg-fosse-orange/10'
                      : 'border-fosse-border bg-fosse-card text-fosse-muted hover:border-fosse-muted'
                  }`}>
                  <span className="text-xl mb-0.5">{h.emoji}</span>
                  <span className="text-[10px]">{h.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <SectionTitle icon={Star} label="Ta note" />
          <div className="flex items-center gap-4">
            <input name="note" type="number" min="0" max="20" step="0.5"
              value={form.note} onChange={handleChange} placeholder="0 – 20"
              className="input-field w-28 text-2xl font-black text-center" />
            {form.note && (
              <div className="text-4xl font-black text-fosse-orange">
                {form.note}<span className="text-lg text-fosse-muted">/20</span>
              </div>
            )}
          </div>

          {/* Journal */}
          <SectionTitle icon={FileText} label="Ton journal" />
          <textarea name="journal" value={form.journal} onChange={handleChange} rows={6}
            placeholder="Raconte ta soirée comme si tu l'écrivais pour ton futur toi..."
            className="input-field resize-none leading-relaxed" />

          {/* Moments clés */}
          <SectionTitle icon={Star} label="Tes moments clés" />
          <p className="text-xs text-fosse-muted -mt-2">Ces petites anecdotes que tu ne veux pas oublier</p>
          <div className="space-y-2">
            {moments.map((m, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-fosse-orange text-xs mt-3 shrink-0">✦</span>
                <input type="text" value={m} onChange={e => updateMoment(i, e.target.value)}
                  placeholder="ex : Il a joué mon titre préféré en rappel..."
                  className="input-field flex-1" />
                {moments.length > 1 && (
                  <button type="button" onClick={() => removeMoment(i)}
                    className="text-fosse-muted hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors mt-0.5">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {moments.length < 10 && (
              <button type="button" onClick={addMoment}
                className="flex items-center gap-2 text-fosse-muted hover:text-fosse-orange text-sm transition-colors py-1 pl-5">
                <Plus className="w-4 h-4" />Ajouter un moment
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Link href="/notifications" className="btn-secondary flex-1 text-center py-3">Annuler</Link>
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
