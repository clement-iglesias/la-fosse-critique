'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Users, ChevronDown } from 'lucide-react'

interface Friend {
  id: string
  username: string
  full_name: string | null
}

interface FriendsTaggerProps {
  selected: string[]
  onChange: (selected: string[]) => void
}

export default function FriendsTagger({ selected, onChange }: FriendsTaggerProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [open, setOpen] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('amis')
        .select(`
          demandeur_id, receveur_id,
          profiles_demandeur:profiles!amis_demandeur_id_fkey(id, username, full_name),
          profiles_receveur:profiles!amis_receveur_id_fkey(id, username, full_name)
        `)
        .or(`demandeur_id.eq.${user.id},receveur_id.eq.${user.id}`)
        .eq('statut', 'accepte')
      if (!data) return
      const list: Friend[] = data.map((ami: Record<string, unknown>) => {
        const isSender = ami.demandeur_id === user.id
        const profile = (isSender ? ami.profiles_receveur : ami.profiles_demandeur) as Friend
        return { id: profile.id, username: profile.username, full_name: profile.full_name }
      })
      setFriends(list)
    }
    load()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (username: string) => {
    const tag = `@${username}`
    if (selected.includes(tag)) onChange(selected.filter(s => s !== tag))
    else onChange([...selected, tag])
  }

  const addCustom = () => {
    const val = customInput.trim()
    if (!val || selected.includes(val)) return
    onChange([...selected, val])
    setCustomInput('')
  }

  const remove = (item: string) => onChange(selected.filter(s => s !== item))

  return (
    <div ref={ref} className="space-y-2">
      {/* Selected tags */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map(s => (
            <span key={s} className="flex items-center gap-1 bg-fosse-orange/15 border border-fosse-orange/30 text-fosse-orange text-xs font-semibold rounded-full px-3 py-1.5">
              {s}
              <button type="button" onClick={() => remove(s)} className="hover:text-white ml-0.5 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Taguer un ami button */}
      {friends.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm text-fosse-muted hover:text-fosse-orange transition-colors border border-fosse-border hover:border-fosse-orange/40 rounded-xl px-3 py-2"
        >
          <Users className="w-4 h-4" />
          Taguer un ami
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {/* Friends dropdown */}
      {open && friends.length > 0 && (
        <div className="bg-fosse-surface border border-fosse-card rounded-2xl p-2 space-y-0.5">
          {friends.map(f => {
            const tag = `@${f.username}`
            const isActive = selected.includes(tag)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.username)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-fosse-orange/10 text-fosse-orange'
                    : 'text-fosse-muted hover:bg-fosse-card hover:text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-fosse-card border border-fosse-border flex items-center justify-center text-xs font-black text-fosse-orange shrink-0">
                  {f.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold">{f.username}</div>
                  {f.full_name && <div className="text-[10px] opacity-60">{f.full_name}</div>}
                </div>
                {isActive && <span className="text-fosse-orange font-black text-xs">✓</span>}
              </button>
            )
          })}
        </div>
      )}

      {/* Free text entry */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom() } }}
          placeholder={friends.length > 0 ? "Ou ajouter quelqu'un d'autre…" : "Sophie, Marc… ou solo !"}
          className="input-field flex-1 text-sm"
        />
        {customInput.trim() && (
          <button type="button" onClick={addCustom}
            className="bg-fosse-orange/10 hover:bg-fosse-orange/20 text-fosse-orange border border-fosse-orange/30 px-3 rounded-xl font-bold transition-colors text-sm">
            +
          </button>
        )}
      </div>
    </div>
  )
}
