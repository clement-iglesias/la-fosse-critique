import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import ConcertCard from '@/components/concerts/ConcertCard'
import { Compass, Music } from 'lucide-react'

export default async function ExplorerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()

  // Concerts publics des autres utilisateurs
  const { data: concerts } = await supabase
    .from('concerts')
    .select('*, profiles!inner(username, visibilite), reactions(id, user_id)')
    .neq('user_id', user.id)
    .eq('statut', 'vu')
    .eq('profiles.visibilite', 'public')
    .order('created_at', { ascending: false })
    .limit(30)

  const processedConcerts = (concerts ?? []).map(c => ({
    ...c,
    nb_reactions: c.reactions?.length ?? 0,
    user_has_liked: c.reactions?.some((r: { user_id: string }) => r.user_id === user.id) ?? false,
  }))

  return (
    <div className="min-h-screen bg-fosse-bg">
      <header className="sticky top-0 z-40 bg-fosse-bg/90 backdrop-blur-sm border-b border-fosse-border">
        <div className="max-w-lg mx-auto flex items-center px-4 h-14 gap-2">
          <Compass className="w-5 h-5 text-fosse-orange" />
          <h1 className="text-lg font-black text-white">Explorer</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 pb-28">
        {processedConcerts.length === 0 ? (
          <div className="bg-[#0e0e0e] border border-dashed border-[#1e1e1e] rounded-2xl p-16 text-center">
            <Music className="w-10 h-10 text-fosse-border mx-auto mb-3" />
            <p className="text-fosse-muted text-sm">Aucun concert public pour l&apos;instant.</p>
            <p className="text-fosse-border text-xs mt-1">Invite des amis à rejoindre La Fosse !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {processedConcerts.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} userId={user.id} />
            ))}
          </div>
        )}
      </main>

      <BottomNav username={profile?.username ?? ''} />
    </div>
  )
}
