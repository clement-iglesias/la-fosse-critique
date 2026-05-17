'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { GENRES_MUSICAUX, HUMEURS_AVANT, HUMEURS_APRES, PLACEMENTS } from '@/lib/types'
import { Save, ArrowLeft, Loader2, Music, Calendar, MapPin, Star, FileText, Clock, Users, Plus, X } from 'lucide-react'
import SetlistSearch from '@/components/concerts/SetlistSearch'

export default function ModifierConcertPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [moments, setMoments] = useState<string[]>([''])
  const [setlistfmId, setSetlistfmId] = useState('')

  const [form, setForm] = useState({
    artiste: '', date_concert: '', salle: '', ville: '', pays: 'France',
    genre: '', note: '', commentaire: '', journal: '', setlist: '',
    humeur_avant: '', humeur_apres: '', avec_qui: '', placement: '',
    statut: 'vu' as 'vu' | 'a_venir',
  })

  useEffect(() => {
    const fetchConcert = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data, error } = await supabase
        .from('concerts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) { router.push('/dashboard'); return }

      setForm({
        artiste: data.artiste ?? '',
        date_concert: data.date_concert ?? '',
        salle: data.salle ?? '',
        ville: data.ville ?? '',
        pays: data.pays ?? 'France',
        genre: data.genre ?? '',
        note: data.note !== null ? String(data.note) : '',
        commentaire: data.commentaire ?? '',
        journal: data.journal ?? '',
        setlist: Array.isArray(data.setlist) ? data.setlist.join('\n') : '',
        humeur_avant: data.humeur_avant ?? '',
        humeur_apres: data.humeur_apres ?? '',
        avec_qui: data.avec_qui ?? '',
        placement: data.placement ?? '',
        statut: data.statut ?? 'vu',
      })
      setMoments(Array.isArray(data.moments_cles) && data.moments_cles.length > 0 ? data.moments_cles : [''])
      setFetching(false)
    }
    fetchConcert()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const addMoment = () => setMoments(prev => [...prev, ''])
  const updateMoment = (i: number, v: string) => setMoments(prev => prev.map((m, idx) => idx === i ? v : m))
  const removeMoment = (i: number) => setMoments(prev => prev.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!form.artiste.trim()) { setError("L'artiste est obligatoire."); setLoading(false); return }
    if (!form.date_concert) { setError('La date est obligatoire.'); setLoading(false); return }

    const noteNum = form.note !== '' ? parseFloat(form.note) : null
    if (noteNum !== null && (noteNum < 0 || noteNum > 20)) {
      setError('La note doit être entre 0 et 20.'); setLoading(false); return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const setlistArr = form.setlist ? form.setlist.split('\n').map(s => s.trim()).filter(Boolean) : []
      const momentsArr = moments.map(m => m.trim()).filter(Boolean)

      const { error: updateError } = await supabase.from('concerts').update({
        artiste: form.artiste.trim(),
        date_concert: form.date_concert,
        salle: form.salle.trim() || null,
        ville: form.ville.trim() || null,
        pays: form.pays,
        genre: form.genre || null,
        note: noteNum,
        journal: form.journal.trim() || null,
        humeur_avant: form.humeur_avant || null,
        humeur_apres: form.humeur_apres || null,
        avec_qui: form.avec_qui.trim() || null,
        placement: form.placement || null,
        moments_cles: momentsArr,
        setlist: setlistArr,
        statut: form.statut,
        setlistfm_id: setlistfmId || undefined,
        updated_at: new Date().toISOString(),
      }).eq('id', id).eq('user_id', user.id)

      if (updateError) throw updateError
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? "Erreur lors de la mise à jour."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const isVu = form.statut === 'vu'

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

  return (
    <div className="min-h-screen bg-fosse-bg">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black">Modifier le concert</h1>
            <p className="text-fosse-muted text-sm">Mets à jour tes souvenirs</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Statut */}
          <div className="flex gap-3">
            {[
              { value: 'vu', label: 'Concert vu', icon: Music },
              { value: 'a_venir', label: "J'y serai", icon: Clock },
            ].map(({ value, label, icon: Icon }) => (
              <button key={value} type="button"
                onClick={() => setForm(prev => ({ ...prev, statut: value as 'vu' | 'a_venir' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border font-semibold transition-all ${
                  form.statut === value
                    ? 'bg-fosse-orange/10 border-fosse-orange text-fosse-orange'
                    : 'bg-fosse-card border-fosse-border text-fosse-muted hover:border-fosse-muted'
                }`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          {/* Artiste */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-fosse-muted">Artiste / Groupe *</label>
            <input name="artiste" type="text" value={form.artiste} onChange={handleChange}
              placeholder="ex : Metallica" className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-fosse-muted">Date *</label>
              <input name="date_concert" type="date" value={form.date_concert} onChange={handleChange}
                className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-fosse-muted">Genre</label>
              <select name="genre" value={form.genre} onChange={handleChange} className="input-field">
                <option value="">Sélectionner</option>
                {GENRES_MUSICAUX.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-fosse-muted">
                <MapPin className="w-3.5 h-3.5 inline mr-1" />Salle
              </label>
              <input name="salle" type="text" value={form.salle} onChange={handleChange}
                placeholder="Zénith de Paris" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-fosse-muted">Ville</label>
              <input name="ville" type="text" value={form.ville} onChange={handleChange}
                placeholder="Paris" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-fosse-muted">
              <Users className="w-3.5 h-3.5 inline mr-1" />Avec qui ?
            </label>
            <input name="avec_qui" type="text" value={form.avec_qui} onChange={handleChange}
              placeholder="Sophie, Marc… ou solo !" className="input-field" />
          </div>

          {/* Placement */}
          {isVu && (
            <>
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
              <SectionTitle icon={Star} label="Note" />
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
              <SectionTitle icon={FileText} label="Journal — ta soirée en mots" />
              <textarea name="journal" value={form.journal} onChange={handleChange} rows={6}
                placeholder={`Raconte ta soirée comme si tu l'écrivais pour ton futur toi...\n\nL'ambiance, les lumières, ce moment précis qui t'a traversé, les frissons, la foule...`}
                className="input-field resize-none leading-relaxed" />

              {/* Moments clés */}
              <SectionTitle icon={Star} label="Moments clés" />
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

              {/* Setlist */}
              <SectionTitle icon={Music} label="Setlist" />
              <SetlistSearch
                artist={form.artiste}
                date={form.date_concert}
                venue={form.salle}
                onImport={(songs, id) => {
                  setForm(prev => ({ ...prev, setlist: songs.join('\n') }))
                  setSetlistfmId(id)
                }}
              />
              <textarea name="setlist" value={form.setlist} onChange={handleChange} rows={5}
                placeholder={"Enter Sandman\nNothing Else Matters\nMaster of Puppets\n..."}
                className="input-field resize-none font-mono text-sm mt-2" />
            </>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard" className="btn-secondary flex-1 text-center py-3">Annuler</Link>
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Mettre à jour
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
