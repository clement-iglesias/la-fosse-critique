'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { HUMEURS_AVANT, HUMEURS_APRES, PLACEMENTS } from '@/lib/types'
import { Save, ArrowLeft, Loader2, Music, MapPin, Star, FileText, Clock, Users, Plus, X } from 'lucide-react'
import SetlistSearch from '@/components/concerts/SetlistSearch'
import SetlistTopPicker from '@/components/concerts/SetlistTopPicker'
import DatePicker from '@/components/ui/DatePicker'
import FriendsTagger from '@/components/concerts/FriendsTagger'
import GenrePicker from '@/components/concerts/GenrePicker'

export default function NouveauConcertPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [moments, setMoments] = useState<string[]>([''])
  const [setlistfmId, setSetlistfmId] = useState('')
  const [topMorceaux, setTopMorceaux] = useState<string[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [avecQui, setAvecQui] = useState<string[]>([])

  const [form, setForm] = useState({
    artiste: '', date_concert: '', salle: '', ville: '', pays: 'France',
    note: '', journal: '', setlist: '',
    humeur_avant: '', humeur_apres: '', placement: '',
    statut: 'vu' as 'vu' | 'a_venir',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push('/auth')
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const addMoment = () => setMoments(prev => [...prev, ''])
  const updateMoment = (i: number, v: string) => setMoments(prev => prev.map((m, idx) => idx === i ? v : m))
  const removeMoment = (i: number) => setMoments(prev => prev.filter((_, idx) => idx !== i))

  // Send notifications to tagged @friends
  const sendTagNotifications = async (
    concertId: string,
    fromUser: { id: string; username: string; full_name: string | null },
    tags: string[],
    concertData: { artiste: string; date_concert: string; ville: string; salle: string }
  ) => {
    const usernames = tags
      .filter(t => t.startsWith('@'))
      .map(t => t.slice(1))
    if (usernames.length === 0) return

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('username', usernames)

    if (!profiles || profiles.length === 0) return

    const notifs = profiles
      .filter((p: { id: string }) => p.id !== fromUser.id)
      .map((p: { id: string; username: string }) => ({
        user_id: p.id,
        from_user_id: fromUser.id,
        type: 'concert_tag',
        data: {
          from_username: fromUser.username,
          from_full_name: fromUser.full_name,
          concert_id: concertId,
          artiste: concertData.artiste,
          date_concert: concertData.date_concert,
          ville: concertData.ville,
          salle: concertData.salle,
        },
        lu: false,
        actioned: false,
      }))

    if (notifs.length > 0) {
      await supabase.from('notifications').insert(notifs)
    }
  }

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

      const { data: profile } = await supabase
        .from('profiles').select('username, full_name').eq('id', user.id).single()

      const setlistArr = form.setlist ? form.setlist.split('\n').map(s => s.trim()).filter(Boolean) : []
      const momentsArr = moments.map(m => m.trim()).filter(Boolean)

      const { data: inserted, error: insertError } = await supabase.from('concerts').insert({
        user_id: user.id,
        artiste: form.artiste.trim(),
        date_concert: form.date_concert,
        salle: form.salle.trim() || null,
        ville: form.ville.trim() || null,
        pays: form.pays,
        genre: genres[0] || null,
        genres: genres,
        note: noteNum,
        journal: form.journal.trim() || null,
        humeur_avant: form.humeur_avant || null,
        humeur_apres: form.humeur_apres || null,
        avec_qui: avecQui.length > 0 ? avecQui.join(', ') : null,
        placement: form.placement || null,
        moments_cles: momentsArr,
        setlist: setlistArr,
        statut: form.statut,
        setlistfm_id: setlistfmId || null,
        top_morceaux: topMorceaux,
      }).select('id').single()

      if (insertError) throw insertError

      // Send tag notifications (fire and forget)
      if (inserted && profile && avecQui.length > 0) {
        sendTagNotifications(
          inserted.id,
          { id: user.id, username: profile.username, full_name: profile.full_name },
          avecQui,
          {
            artiste: form.artiste.trim(),
            date_concert: form.date_concert,
            ville: form.ville.trim(),
            salle: form.salle.trim(),
          }
        )
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement.")
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

  return (
    <div className="min-h-screen bg-fosse-bg">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black">Nouveau souvenir</h1>
            <p className="text-fosse-muted text-sm">Capture tout ce que tu as vécu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium mb-1.5 text-fosse-muted">Artiste / Groupe *</label>
            <input name="artiste" type="text" value={form.artiste} onChange={handleChange}
              placeholder="ex : Metallica" className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Date *"
              value={form.date_concert}
              onChange={date => { setForm(prev => ({ ...prev, date_concert: date })); setError('') }}
              required
            />
            <div>
              <label className="block text-sm font-medium mb-1.5 text-fosse-muted">Ville</label>
              <input name="ville" type="text" value={form.ville} onChange={handleChange}
                placeholder="Paris" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-fosse-muted">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />Salle
            </label>
            <input name="salle" type="text" value={form.salle} onChange={handleChange}
              placeholder="Zénith de Paris" className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-fosse-muted">Genre(s)</label>
            <GenrePicker selected={genres} onChange={setGenres} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-fosse-muted">
              <Users className="w-3.5 h-3.5 inline mr-1" />Avec qui ?
            </label>
            <FriendsTagger selected={avecQui} onChange={setAvecQui} />
          </div>

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

              <SectionTitle icon={FileText} label="Journal — ta soirée en mots" />
              <textarea name="journal" value={form.journal} onChange={handleChange} rows={6}
                placeholder="Raconte ta soirée comme si tu l'écrivais pour ton futur toi..."
                className="input-field resize-none leading-relaxed" />

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
              {form.setlist.trim() && (
                <div className="mt-3">
                  <SetlistTopPicker
                    songs={form.setlist.split('\n').map(s => s.trim()).filter(Boolean)}
                    topMorceaux={topMorceaux}
                    onChange={setTopMorceaux}
                  />
                </div>
              )}
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
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
