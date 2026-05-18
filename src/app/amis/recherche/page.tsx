'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Search, UserPlus, Loader2, Check } from 'lucide-react'
import Image from 'next/image'

interface ProfileResult {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  amiStatut?: string | null
}

export default function RechercheAmisPage() {
  const router = useRouter()
  const supabase = createClient()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProfileResult[]>([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<Set<string>>(new Set())

  const search = async () => {
    if (!query.trim() || query.length < 2) return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(10)

      setResults(data ?? [])
    } finally {
      setLoading(false)
    }
  }

  const sendRequest = async (targetId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('amis').insert({
      demandeur_id: user.id,
      receveur_id: targetId,
      statut: 'en_attente',
    })
    setSent(prev => { const s = new Set(prev); s.add(targetId); return s })
  }

  return (
    <div className="min-h-screen bg-fosse-bg">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/amis" className="p-2 rounded-xl bg-fosse-card border border-fosse-border text-fosse-muted hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black text-white">Trouver des amis</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fosse-muted" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="Nom d'utilisateur ou prénom..."
              className="input-field pl-9"
            />
          </div>
          <button onClick={search} disabled={loading} className="btn-primary px-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Chercher'}
          </button>
        </div>

        <div className="space-y-2">
          {results.map(profile => (
            <div key={profile.id} className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-4 flex items-center gap-3">
              <Link href={`/profil/${profile.username}`} className="w-10 h-10 rounded-xl bg-fosse-card border border-fosse-border flex items-center justify-center font-black text-fosse-orange overflow-hidden shrink-0">
                {profile.avatar_url
                  ? <Image src={profile.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                  : profile.username.charAt(0).toUpperCase()
                }
              </Link>
              <Link href={`/profil/${profile.username}`} className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{profile.full_name || profile.username}</p>
                <p className="text-fosse-muted text-xs">@{profile.username}</p>
              </Link>
              {sent.has(profile.id) ? (
                <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-fosse-card border border-fosse-border text-fosse-muted text-xs">
                  <Check className="w-3 h-3" /> Envoyé
                </span>
              ) : (
                <button onClick={() => sendRequest(profile.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fosse-orange/10 border border-fosse-orange/30 text-fosse-orange text-xs font-semibold hover:bg-fosse-orange hover:text-white transition-all">
                  <UserPlus className="w-3.5 h-3.5" /> Ajouter
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
