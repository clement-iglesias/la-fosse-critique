'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Compass, PlusCircle, Users, User } from 'lucide-react'

interface BottomNavProps {
  username: string
}

export default function BottomNav({ username }: BottomNavProps) {
  const pathname = usePathname()

  const items = [
    { href: '/dashboard', icon: BookOpen, label: 'Journal' },
    { href: '/explorer', icon: Compass, label: 'Explorer' },
    { href: '/concerts/nouveau', icon: null, label: 'Ajouter' },
    { href: '/amis', icon: Users, label: 'Amis' },
    { href: `/profil/${username}`, icon: User, label: 'Profil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-fosse-bg/95 backdrop-blur-sm border-t border-fosse-border">
      <div className="max-w-lg mx-auto flex items-end justify-around px-2 pb-safe">
        {items.map(({ href, icon: Icon, label }) => {
          if (!Icon) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center py-2 px-3 -mt-4">
                <div className="w-12 h-12 bg-fosse-orange rounded-2xl flex items-center justify-center shadow-lg shadow-fosse-orange/20">
                  <PlusCircle className="w-6 h-6 text-white" />
                </div>
              </Link>
            )
          }

          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 py-3 px-3 transition-colors ${
                isActive ? 'text-fosse-orange' : 'text-fosse-border hover:text-fosse-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-semibold uppercase tracking-wider">{label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-fosse-orange" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
