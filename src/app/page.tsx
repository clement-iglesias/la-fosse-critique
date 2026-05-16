import Link from 'next/link'
import { Music, Users, Star, Calendar, ChevronRight, Mic2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-fosse-bg overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-fosse-border/50 bg-fosse-bg/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Mic2 className="w-6 h-6 text-fosse-orange" />
          <span className="font-bold text-lg tracking-tight">La Fosse Critique</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="btn-ghost text-sm">
            Connexion
          </Link>
          <Link href="/auth?mode=register" className="btn-primary text-sm">
            Créer un compte
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center">
        {/* Glow */}
        <div className="absolute inset-0 bg-concert-glow pointer-events-none" />

        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fosse-orange/10 border border-fosse-orange/20 text-fosse-orange text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-fosse-orange animate-pulse" />
            Bêta — rejoins les premiers membres
          </div>

          <h1 className="text-5xl sm:text-6xl font-black mb-6 leading-tight">
            Ton journal de
            <span className="text-fosse-orange"> concerts</span>
            <br />personnel
          </h1>

          <p className="text-xl text-fosse-muted max-w-xl mx-auto mb-10 leading-relaxed">
            Note sur 20, commente et partage chaque concert que tu as vécu.
            Découvre ce que tes amis écoutent sur scène.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth?mode=register" className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
              Commencer gratuitement
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/auth" className="btn-secondary text-base px-8 py-3">
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Star,
              title: 'Note sur 20',
              desc: 'Système à la française, plus précis que les étoiles. De 0 à 20, avec décimales.',
            },
            {
              icon: Music,
              title: 'Tous genres',
              desc: 'Rock, métal, électro, jazz, rap... Répertorie chaque concert, peu importe le style.',
            },
            {
              icon: Users,
              title: 'Réseau social',
              desc: 'Ajoute des amis, vois leurs concerts, découvre qui sera au même show que toi.',
            },
            {
              icon: Calendar,
              title: 'Concerts à venir',
              desc: 'Signale ta présence à un concert futur. Tes amis sauront que tu seras là.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 hover:border-fosse-orange/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-fosse-orange/10 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-fosse-orange" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-fosse-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats fictives — ambiance */}
      <section className="border-t border-fosse-border py-16 px-6">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { value: '—', label: 'Concerts répertoriés' },
            { value: '—', label: 'Artistes uniques' },
            { value: '—', label: 'Membres' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-black text-fosse-orange mb-1">{value}</div>
              <div className="text-sm text-fosse-muted">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 text-center border-t border-fosse-border">
        <h2 className="text-3xl font-bold mb-4">
          Prêt à descendre dans la fosse ?
        </h2>
        <p className="text-fosse-muted mb-8">Gratuit, toujours.</p>
        <Link href="/auth?mode=register" className="btn-primary text-base px-10 py-3">
          Créer mon profil
        </Link>
      </section>

      <footer className="border-t border-fosse-border py-6 px-6 text-center text-fosse-muted text-sm">
        © 2025 La Fosse Critique
      </footer>
    </div>
  )
}
