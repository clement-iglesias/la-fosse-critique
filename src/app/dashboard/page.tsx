import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BottomNav from '@/components/layout/BottomNav'
import ConcertCard from '@/components/concerts/ConcertCard'
import Link from 'next/link'
import { Music, Star, Calendar, Users, Mic2, Bell } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth')

  const { data: concerts } = await supabase
    .from('concerts')
    .select('*, reactions(id, user_id)')
    .eq('user_id', user.id)
    .order('date_concert', { ascending: false })
    .limit(20)

  const processedConcerts = (concerts ?? []).map(c => ({
    ...c,
    nb_reactions: c.reactions?.length ?? 0,
    user_has_liked: c.reactions?.some((r: { user_id: string }) => r.user_id === user.id) ?? false,
  }))

  const vus = processedConcerts.filter(c => c.statut === 'vu')
  const aVenir = processedConcerts.filter(c => c.statut === 'a_venir')

  const totalConcerts = vus.length
  const artistesUniques = new Set(vus.map(c => c.artiste)).size
  const notes = vus.filter(c => c.note !== null).map(c => c.note as number)
  const avgNote = notes.length > 0
    ? (notes.reduce((s, n) => s + n, 0) / notes.length).toFixed(1)
    : null

  const artisteCounts = vus.reduce((acc, c) => {
    acc[c.artiste] = (acc[c.artiste] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topArtiste = Object.entries(artisteCounts).sort((a, b) => b[1] - a[1])[0] ?? null

  return (
    <div className="min-h-screen bg-fosse-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-fosse-bg/90 backdrop-blur-sm border-b border-fosse-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-fosse-orange rounded-lg flex items-center justify-center">
              <Mic2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-black text-sm text-white leading-none">La Fosse</div>
              <div className="text-[9px] font-bold text-fosse-orange uppercase tracking-wider leading-none">Critique</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/profil" className="text-fosse-muted hover:text-fosse-text p-2 rounded-xl hover:bg-fosse-card transition-colors">
              <Bell className="w-5 h-5" />
            </Link>
            <Link href={`/profil/${profile.username}`}
              className="w-8 h-8 rounded-full bg-fosse-card border border-fosse-border flex items-center justify-center text-xs font-black text-fosse-orange hover:border-fosse-orange transition-colors">
              {profile.username.charAt(0).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 pb-28">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-black">
            Salut, <span className="text-fosse-orange">{profile.full_name?.split(' ')[0] || profile.username}</span> 👋
          </h1>
          <p className="text-fosse-muted text-sm mt-1">Ton journal de concerts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { icon: Music, label: 'Concerts', value: totalConcerts },
            { icon: Users, label: 'Artistes', value: artistesUniques },
            { icon: Star, label: 'Note moy.', value: avgNote ? `${avgNote}` : '—' },
            { icon: Calendar, label: 'À venir', value: aVenir.length },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-fosse-surface border border-fosse-card rounded-2xl p-3 text-center">
              <Icon className="w-4 h-4 text-fosse-orange mx-auto mb-1.5" />
              <div className="text-lg font-black text-white leading-none">{value}</div>
              <div className="text-[9px] text-fosse-border mt-1 uppercase tracking-wider font-semibold">{label}</div>
            </div>
          ))}
        </div>

        {/* Top artiste */}
        {topArtiste && (
          <div className="flex items-center gap-3 bg-fosse-surface border border-fosse-card rounded-2xl px-4 py-3 mb-6">
            <Mic2 className="w-4 h-4 text-fosse-orange shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] text-fosse-border uppercase tracking-wider font-semibold mb-0.5">Artiste vu le plus souvent</div>
              <div className="text-sm font-black text-white truncate">{topArtiste[0]}</div>
            </div>
            <div className="text-fosse-orange font-black text-sm shrink-0">
              ×{topArtiste[1]}
            </div>
          </div>
        )}

        {/* À venir */}
        {aVenir.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-fosse-amber" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-fosse-muted">Prochains concerts</h2>
            </div>
            <div className="space-y-3">
              {aVenir.map(c => (
                <ConcertCard key={c.id} concert={c} userId={user.id} />
              ))}
            </div>
          </section>
        )}

        {/* Journal */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Music className="w-4 h-4 text-fosse-orange" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-fosse-muted">Mon journal</h2>
          </div>

          {vus.length === 0 ? (
            <div className="bg-fosse-surface border border-dashed border-fosse-card rounded-2xl p-12 text-center">
              <Music className="w-10 h-10 text-fosse-border mx-auto mb-3" />
              <p className="text-fosse-muted mb-4 text-sm">Ton journal est vide.</p>
              <Link href="/concerts/nouveau" className="btn-primary">
                Ajouter mon premier concert
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vus.map(c => (
                <ConcertCard key={c.id} concert={c} userId={user.id} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav username={profile.username} />
    </div>
  )
}
