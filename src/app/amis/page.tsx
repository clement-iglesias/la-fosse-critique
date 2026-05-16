import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import { Users, UserPlus, Search, Check, Clock, UserCheck } from 'lucide-react'
import Image from 'next/image'

export default async function AmisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()

  // Amis acceptés
  const { data: amisData } = await supabase
    .from('amis')
    .select('*, demandeur:profiles!amis_demandeur_id_fkey(id, username, full_name, avatar_url), receveur:profiles!amis_receveur_id_fkey(id, username, full_name, avatar_url)')
    .eq('statut', 'accepte')
    .or(`demandeur_id.eq.${user.id},receveur_id.eq.${user.id}`)

  // Demandes reçues en attente
  const { data: demandesRecues } = await supabase
    .from('amis')
    .select('*, demandeur:profiles!amis_demandeur_id_fkey(id, username, full_name, avatar_url)')
    .eq('receveur_id', user.id)
    .eq('statut', 'en_attente')

  const amis = (amisData ?? []).map(a => {
    const ami = a.demandeur_id === user.id ? a.receveur : a.demandeur
    return { ...ami, amiId: a.id }
  })

  return (
    <div className="min-h-screen bg-fosse-bg">
      <header className="sticky top-0 z-40 bg-fosse-bg/90 backdrop-blur-sm border-b border-fosse-border">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-fosse-orange" />
            <h1 className="text-lg font-black text-white">Amis</h1>
          </div>
          <Link href="/amis/recherche" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fosse-card border border-fosse-border text-fosse-muted hover:text-white text-sm transition-colors">
            <Search className="w-4 h-4" />
            Chercher
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-5 pb-28 space-y-6">
        {/* Demandes en attente */}
        {(demandesRecues ?? []).length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-fosse-amber" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-fosse-muted">
                Demandes reçues <span className="text-fosse-border">({demandesRecues!.length})</span>
              </h2>
            </div>
            <div className="space-y-2">
              {demandesRecues!.map((d) => (
                <div key={d.id} className="bg-[#0e0e0e] border border-fosse-amber/20 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-fosse-card border border-fosse-border flex items-center justify-center font-black text-fosse-orange overflow-hidden shrink-0">
                    {d.demandeur.avatar_url
                      ? <Image src={d.demandeur.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                      : d.demandeur.username.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{d.demandeur.full_name || d.demandeur.username}</p>
                    <p className="text-fosse-muted text-xs">@{d.demandeur.username}</p>
                  </div>
                  <AcceptButton amiId={d.id} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Liste amis */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4 text-fosse-orange" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-fosse-muted">
              Mes amis <span className="text-fosse-border">({amis.length})</span>
            </h2>
          </div>

          {amis.length === 0 ? (
            <div className="bg-[#0e0e0e] border border-dashed border-[#1e1e1e] rounded-2xl p-12 text-center">
              <UserPlus className="w-10 h-10 text-fosse-border mx-auto mb-3" />
              <p className="text-fosse-muted text-sm mb-3">Tu n&apos;as pas encore d&apos;amis.</p>
              <Link href="/amis/recherche" className="btn-primary text-sm">
                Trouver des amis
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {amis.map((ami) => (
                <Link key={ami.id} href={`/profil/${ami.username}`}
                  className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-2xl p-4 flex items-center gap-3 hover:border-[#2a2a2a] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-fosse-card border border-fosse-border flex items-center justify-center font-black text-fosse-orange overflow-hidden shrink-0">
                    {ami.avatar_url
                      ? <Image src={ami.avatar_url} alt="" width={40} height={40} className="w-full h-full object-cover" />
                      : ami.username.charAt(0).toUpperCase()
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{ami.full_name || ami.username}</p>
                    <p className="text-fosse-muted text-xs">@{ami.username}</p>
                  </div>
                  <Check className="w-4 h-4 text-fosse-border" />
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav username={profile?.username ?? ''} />
    </div>
  )
}

// Petit composant client pour le bouton accepter
function AcceptButton({ amiId }: { amiId: string }) {
  return (
    <form action={`/api/amis/accepter`} method="POST">
      <input type="hidden" name="amiId" value={amiId} />
      <button type="submit" className="px-3 py-1.5 rounded-xl bg-fosse-orange/10 border border-fosse-orange/30 text-fosse-orange text-xs font-semibold hover:bg-fosse-orange hover:text-white transition-all">
        Accepter
      </button>
    </form>
  )
}
