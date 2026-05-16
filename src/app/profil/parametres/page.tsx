'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2, User, MapPin, Music, Globe, Lock, Users } from 'lucide-react'
import { GENRES_MUSICAUX } from '@/lib/types'

export default function ParametresPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    bio: '',
    ville: '',
    visibilite: 'public' as 'public' | 'amis' | 'prive',
    genres_favoris: [] as string[],
  })

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setForm({
          full_name: profile.full_name ?? '',
          bio: profile.bio ?? '',
          ville: profile.ville ?? '',
          visibilite: profile.visibilite ?? 'public',
          genres_favoris: profile.genres_favoris ?? [],
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  const toggleGenre = (genre: string) => {
    setForm(prev => ({
      ...prev,
      genres_favoris: prev.genres_favoris.includes(genre)
        ? prev.genres_favoris.filter(g => g !== genre)
        : prev.genres_favoris.length < 5
          ? [...prev.genres_favoris, genre]
          : prev.genres_favoris,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error: updateError } = await supabase.from('profiles').update({
        full_name: form.full_name.trim() || null,
        bio: form.bio.trim() || null,
        ville: form.ville.trim() || null,
        visibilite: form.visibilite,
        genres_favoris: form.genres_favoris,
      }).eq('id', user.id)

      if (updateError) throw updateError
      setSuccess('Profil mis à jour !')
      setTimeout(() => router.back(), 1000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const VISIBILITE = [
    { value: 'public', label: 'Public', desc: 'Tout le monde voit ton profil', icon: Globe, color: 'text-green-400 border-green-400/30 bg-green-400/5' },
    { value: 'amis', label: 'Amis seulement', desc: 'Réservé à tes amis', icon: Users, color: 'text-fosse-amber border-fosse-amber/30 bg-fosse-amber/5' },
    { value: 'prive', label: 'Privé', desc: 'Profil invisible', icon: Lock, color: 'text-fosse-muted border-fosse-border bg-fosse-card' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-fosse-bg flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-fosse-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fosse-bg">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl bg-fosse-card border border-fosse-border text-fosse-muted hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-white">Paramètres</h1>
            <p className="text-fosse-muted text-sm">Personnalise ton profil</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Infos perso */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-fosse-orange" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-fosse-muted">Informations</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-fosse-muted">Nom affiché</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Ton nom ou pseudo"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-fosse-muted">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Dis-nous qui tu es..."
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-fosse-muted">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />Ville
                </label>
                <input
                  type="text"
                  value={form.ville}
                  onChange={e => setForm(p => ({ ...p, ville: e.target.value }))}
                  placeholder="Paris, Lyon, Bordeaux..."
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Visibilité */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-fosse-orange" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-fosse-muted">Visibilité du profil</h2>
            </div>
            <div className="space-y-2">
              {VISIBILITE.map(({ value, label, desc, icon: Icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, visibilite: value as typeof form.visibilite }))}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    form.visibilite === value ? color : 'border-fosse-border bg-fosse-card/30 text-fosse-muted'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-xs opacity-60">{desc}</div>
                  </div>
                  {form.visibilite === value && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-fosse-orange" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Genres favoris */}
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-fosse-orange" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-fosse-muted">Genres favoris</h2>
              </div>
              <span className="text-xs text-fosse-border">{form.genres_favoris.length}/5</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRES_MUSICAUX.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    form.genres_favoris.includes(genre)
                      ? 'bg-fosse-orange/10 border-fosse-orange text-fosse-orange'
                      : 'border-fosse-border bg-fosse-card text-fosse-muted hover:border-fosse-muted'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Bouton sauvegarder */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  )
}
