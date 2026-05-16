import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import ConcertCard from '@/components/concerts/ConcertCard'
import { Music, Star, Users, MapPin, Lock, UserCheck, Settings } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Props { params: Promise<{ username: string }> }

export default async function ProfilPage({ params }: Props) {
  const { username } = await params
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (!profile) notFound()

  const isOwner = currentUser?.id === profile.id
  let canView = profile.visibilite === 'public' || isOwner

  if (!canView && profile.visibilite === 'amis' && currentUser) {
    const { data: ami } = await supabase.from('amis').select('id').eq('statut', 'accepte')
      .or(`and(demandeur_id.eq.${currentUser.id},receveur_id.eq.${profile.id}),and(receveur_id.eq.${currentUser.id},demandeur_id.eq.${profile.id})`)
      .single()
    canView = !!ami
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let concerts: any[] = []
  let stats = { total: 0, artistes: 0, avgNote: null as string | null }

  if (canView) {
    const { data: concertsData } = await supabase
      .from('concerts')
      .select('*, reactions(id, user_id)')
      .eq('user_id', profile.id)
      .eq('statut', 'vu')
      .order('date_concert', { ascending: false })

    concerts = (concertsData ?? []).map(c => ({
      ...c,
      nb_reactions: c.reactions?.length ?? 0,
      user_has_liked: currentUser ? c.reactions?.some((r: { user_id: string }) => r.user_id === currentUser.id) : false,
    }))

    const artistesSet = new Set(concerts.map(c => c.artiste as string))
    const notes = concerts.filter(c => c.note !== null).map(c => c.note as number)
    stats = {
      total: concerts.length,
      artistes: artistesSet.size,
      avgNote: notes.length > 0 ? (notes.reduce((s, n) => s + n, 0) / notes.length).toFixed(1) : null
    }
  }

  const currentUsername = currentUser
    ? (await supabase.from('profiles').select('username').eq('id', currentUser.id).single()).data?.username ?? ''
    : ''

  return (
    <div className="min-h-screen bg-fosse-bg">
      <main className="max-w-lg mx-auto px-4 pt-6 pb-28">
        {/* Profil card */}
        <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-5 mb-5">
          <div className="flex items-start gap-4 mb-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-fosse-card border-2 border-fosse-border flex items-center justify-center text-2xl font-black text-fosse-orange overflow-hidden shrink-0">
              {profile.avatar_url
                ? <Image src={profile.avatar_url} alt="" width={80} height={80} className="w-full h-full object-cover" />
                : profile.username.charAt(0).toUpperCase()
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h1 className="text-lg font-black text-white leading-tight">
                    {profile.full_name || profile.username}
                  </h1>
                  <p className="text-fosse-muted text-sm">@{profile.username}</p>
                </div>
                {isOwner && (
                  <Link href="/profil/parametres" className="p-2 rounded-xl bg-fosse-card border border-fosse-border text-fosse-muted hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2 mt-2">
                {profile.visibilite === 'public' && (
                  <span className="badge bg-green-400/10 text-green-400 border border-green-400/20 text-[10px]">
                    <UserCheck className="w-3 h-3" /> Public
                  </span>
                )}
                {profile.visibilite === 'amis' && (
                  <span className="badge bg-fosse-amber/10 text-fosse-amber border border-fosse-amber/20 text-[10px]">
                    <Users className="w-3 h-3" /> Amis
                  </span>
                )}
                {profile.visibilite === 'prive' && (
                  <span className="badge bg-fosse-card text-fosse-muted border border-fosse-border text-[10px]">
                    <Lock className="w-3 h-3" /> Privé
                  </span>
                )}
              </div>
            </div>
          </div>

          {profile.bio && (
            <p className="text-sm text-fosse-text leading-relaxed mb-4">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-fosse-muted mb-5">
            {profile.ville && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.ville}</span>}
            {profile.genres_favoris?.length > 0 && (
              <span className="flex items-center gap-1"><Music className="w-3 h-3" />{profile.genres_favoris.slice(0, 3).join(', ')}</span>
            )}
          </div>

          {/* Stats */}
          {canView && (
            <div className="flex border-t border-fosse-border pt-4">
              {[
                { icon: Music, label: 'Concerts', value: stats.total },
                { icon: Users, label: 'Artistes', value: stats.artistes },
                { icon: Star, label: 'Note moy.', value: stats.avgNote ? `${stats.avgNote}/20` : '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex-1 text-center">
                  <div className="text-xl font-black text-white">{value}</div>
                  <div className="text-[10px] text-fosse-muted flex items-center justify-center gap-1 mt-0.5">
                    <Icon className="w-3 h-3" />{label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Concerts ou verrou */}
        {!canView ? (
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-12 text-center">
            <Lock className="w-10 h-10 text-fosse-border mx-auto mb-3" />
            <p className="text-fosse-muted text-sm">
              {profile.visibilite === 'prive' ? 'Ce profil est privé.' : 'Ce profil est réservé aux amis.'}
            </p>
          </div>
        ) : concerts.length === 0 ? (
          <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-12 text-center">
            <Music className="w-10 h-10 text-fosse-border mx-auto mb-3" />
            <p className="text-fosse-muted text-sm">Aucun concert enregistré.</p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Music className="w-4 h-4 text-fosse-orange" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-fosse-muted">
                Journal <span className="text-fosse-border">({concerts.length})</span>
              </h2>
            </div>
            <div className="space-y-3">
              {concerts.map((concert: Parameters<typeof ConcertCard>[0]['concert']) => (
                <ConcertCard key={concert.id} concert={concert} userId={currentUser?.id ?? null}
                  onDelete={isOwner ? undefined : undefined} />
              ))}
            </div>
          </div>
        )}
      </main>

      {currentUser && <BottomNav username={currentUsername} />}
    </div>
  )
}
