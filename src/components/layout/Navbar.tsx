'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Mic2, LayoutDashboard, PlusCircle, User, LogOut, Bell, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface NavbarProps {
  username: string
}

export default function Navbar({ username }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
    { href: '/concerts/nouveau', label: 'Ajouter', icon: PlusCircle },
    { href: `/profil/${username}`, label: 'Mon profil', icon: User },
    { href: '/amis', label: 'Amis', icon: Users },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-fosse-bg/90 backdrop-blur-sm border-b border-fosse-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-fosse-text hover:text-white transition-colors">
          <Mic2 className="w-5 h-5 text-fosse-orange" />
          <span className="hidden sm:inline">La Fosse Critique</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-fosse-card text-fosse-orange'
                  : 'text-fosse-muted hover:text-fosse-text hover:bg-fosse-card'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button className="btn-ghost p-2 relative">
            <Bell className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn-ghost p-2 text-fosse-muted hover:text-red-400"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  )
}
