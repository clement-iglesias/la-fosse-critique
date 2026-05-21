'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Bell, Music, Check, X, Loader2 } from 'lucide-react'
import BottomNav from '@/components/layout/BottomNav'

interface Notif {
  id: string
  type: string
  data: {
    from_username: string
    from_full_name?: string
    concert_id: string
    artiste: string
    date_concert: string
    ville?: string
    salle?: string
  }
  lu: boolean
  actioned: boolean
  created_at: string
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `il y a ${d} jour${d > 1 ? 's' : ''}`
  if (h > 0) return `il y a ${h}h`
  return `à l'instant`
}

export default function NotificationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }

      const { data: profile } = await supabase
        .from('profiles').select('username').eq('id', user.id).single()
      if (profile) setUsername(profile.username)

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifs((data ?? []) as Notif[])

      // Mark all as read
      await supabase
        .from('notifications')
        .update({ lu: true })
        .eq('user_id', user.id)
        .eq('lu', false)

      setLoading(false)
    }
    load()
  }, [])

  const dismiss = async (id: string) => {
    await supabase.from('notifications').update({ actioned: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, actioned: true } : n))
  }

  const pending = notifs.filter(n => !n.actioned)
  const done = notifs.filter(n => n.actioned)

  if (loading) {
    return (
      <div className="min-h-screen bg-fosse-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-fosse-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fosse-bg">
      <header className="sticky top-0 z-40 bg-fosse-bg/90 backdrop-blur-sm border-b border-fosse-border">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <Link href="/dashboard" className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-black">Notifications</h1>
          {pending.length > 0 && (
            <span className="ml-auto bg-fosse-orange text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
              {pending.length}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 pb-28 space-y-3">
        {notifs.length === 0 && (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-fosse-border mx-auto mb-3" />
            <p className="text-fosse-muted text-sm">Aucune notification pour l'instant.</p>
          </div>
        )}

        {pending.map(n => (
          <div key={n.id} className="bg-fosse-surface border border-fosse-orange/20 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-fosse-orange/10 border border-fosse-orange/30 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-fosse-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-snug">
                  <span className="font-black text-fosse-orange">@{n.data.from_username}</span>
                  {' '}t'a tagué dans un concert
                </p>
                <div className="mt-1.5 bg-fosse-card border border-fosse-border rounded-xl px-3 py-2">
                  <p className="font-black text-sm text-white">{n.data.artiste}</p>
                  <p className="text-xs text-fosse-muted mt-0.5">
                    {formatDate(n.data.date_concert)}
                    {n.data.ville ? ` · ${n.data.ville}` : ''}
                    {n.data.salle ? ` · ${n.data.salle}` : ''}
                  </p>
                </div>
                <p className="text-[10px] text-fosse-border mt-2">{timeAgo(n.created_at)}</p>
              </div>
            </div>

            <p className="text-xs text-fosse-muted mb-3">Veux-tu ajouter ce concert à ton journal ?</p>

            <div className="flex gap-2">
              <Link
                href={`/concerts/copier/${n.data.concert_id}`}
                onClick={() => dismiss(n.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-fosse-orange text-white text-sm font-bold rounded-xl hover:bg-fosse-orange/90 transition-colors"
              >
                <Check className="w-4 h-4" />
                Oui, ajouter !
              </Link>
              <button
                onClick={() => dismiss(n.id)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-fosse-card border border-fosse-border text-fosse-muted text-sm font-semibold rounded-xl hover:text-white hover:border-fosse-muted transition-colors"
              >
                <X className="w-4 h-4" />
                Non
              </button>
            </div>
          </div>
        ))}

        {done.length > 0 && (
          <>
            {pending.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-px bg-fosse-border" />
                <span className="text-[10px] text-fosse-border uppercase tracking-widest font-bold">Traitées</span>
                <div className="flex-1 h-px bg-fosse-border" />
              </div>
            )}
            {done.map(n => (
              <div key={n.id} className="bg-fosse-surface border border-fosse-card rounded-2xl p-4 opacity-50">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-fosse-card flex items-center justify-center shrink-0">
                    <Music className="w-4 h-4 text-fosse-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-fosse-muted leading-snug">
                      <span className="font-semibold">@{n.data.from_username}</span>
                      {' '}t'a tagué dans <span className="font-semibold">{n.data.artiste}</span>
                    </p>
                    <p className="text-[10px] text-fosse-border mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      <BottomNav username={username} />
    </div>
  )
}
