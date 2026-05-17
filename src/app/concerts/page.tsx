import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import ConcertCard from '@/components/concerts/ConcertCard'
import Link from 'next/link'
import { PlusCircle, Music } from 'lucide-react'

export default async function ConcertsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles').select('username').eq('id', user.id).single()
  if (!profile) redirect('/auth')

  const { data: concerts } = await supabase
    .from('concerts')
    .select('*')
    .eq('user_id', user.id)
    .order('date_concert', { ascending: false })

  const vus = concerts?.filter(c => c.statut === 'vu') ?? []

  return (
    <div className="min-h-screen bg-fosse-bg">
      <Navbar username={profile.username} />
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Music className="w-6 h-6 text-fosse-orange" />
            Mes concerts
            <span className="text-fosse-muted font-normal text-lg">({vus.length})</span>
          </h1>
          <Link href="/concerts/nouveau" className="btn-primary flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Ajouter
          </Link>
        </div>

        {vus.length === 0 ? (
          <div className="card p-12 text-center">
            <Music className="w-10 h-10 text-fosse-border mx-auto mb-3" />
            <p className="text-fosse-muted mb-4">Aucun concert enregistré.</p>
            <Link href="/concerts/nouveau" className="btn-primary">
              Ajouter mon premier concert
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {vus.map(concert => (
              <ConcertCard key={concert.id} concert={concert} userId={user.id} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
    </div>
  )
}
