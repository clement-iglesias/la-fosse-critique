'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, MessageCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Commentaire } from '@/lib/types'
import Image from 'next/image'

interface CommentSheetProps {
  concertId: string
  concertLabel: string
  userId: string | null
  onClose: () => void
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "À l'instant"
  if (m < 60) return `Il y a ${m}min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  return `Il y a ${Math.floor(h / 24)}j`
}

export default function CommentSheet({ concertId, concertLabel, userId, onClose }: CommentSheetProps) {
  const [commentaires, setCommentaires] = useState<Commentaire[]>([])
  const [newComment, setNewComment] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadComments()
    // Realtime subscription
    const channel = supabase
      .channel(`comments-${concertId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'commentaires',
        filter: `concert_id=eq.${concertId}`
      }, () => loadComments())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [concertId])

  const loadComments = async () => {
    const { data } = await supabase
      .from('commentaires')
      .select('*, profiles(username, avatar_url, full_name)')
      .eq('concert_id', concertId)
      .order('created_at', { ascending: true })
    setCommentaires(data ?? [])
    setLoading(false)
    setTimeout(() => listRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 50)
  }

  const send = async () => {
    if (!newComment.trim() || !userId || sending) return
    setSending(true)
    await supabase.from('commentaires').insert({
      user_id: userId, concert_id: concertId, contenu: newComment.trim()
    })
    setNewComment('')
    setSending(false)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg bg-fosse-surface rounded-t-2xl border-t border-fosse-border flex flex-col"
        style={{ maxHeight: '75vh' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-fosse-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-fosse-border">
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-fosse-orange" />
              Commentaires
            </div>
            <div className="text-xs text-fosse-muted mt-0.5">{concertLabel}</div>
          </div>
          <button onClick={onClose} className="text-fosse-muted hover:text-white p-1 rounded-lg hover:bg-fosse-card">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Liste */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-fosse-muted" />
            </div>
          ) : commentaires.length === 0 ? (
            <div className="text-center py-10 text-fosse-muted text-sm">
              Aucun commentaire pour l&apos;instant. Sois le premier !
            </div>
          ) : commentaires.map(c => (
            <div key={c.id} className="flex gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-fosse-card border border-fosse-border flex items-center justify-center text-xs font-bold text-fosse-orange shrink-0 overflow-hidden">
                {c.profiles?.avatar_url ? (
                  <Image src={c.profiles.avatar_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                ) : (
                  (c.profiles?.username ?? '?').charAt(0).toUpperCase()
                )}
              </div>
              {/* Bulle */}
              <div className="flex-1">
                <div className="bg-fosse-card rounded-xl rounded-tl-sm px-3 py-2 border border-fosse-border">
                  <div className="text-xs font-semibold text-fosse-muted mb-1">
                    @{c.profiles?.username}
                  </div>
                  <div className="text-sm text-fosse-text leading-relaxed">{c.contenu}</div>
                </div>
                <div className="text-[10px] text-fosse-border mt-1 px-1">{timeAgo(c.created_at)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        {userId ? (
          <div className="px-4 py-3 border-t border-fosse-border flex gap-2 items-center">
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ajoute un commentaire..."
              className="flex-1 bg-fosse-card border border-fosse-border rounded-xl px-4 py-2.5 text-sm text-fosse-text placeholder-fosse-border outline-none focus:border-fosse-orange transition-colors"
            />
            <button
              onClick={send}
              disabled={!newComment.trim() || sending}
              className="w-10 h-10 bg-fosse-orange rounded-xl flex items-center justify-center disabled:opacity-40 hover:bg-fosse-orange-dim transition-colors shrink-0"
            >
              {sending ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
            </button>
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-fosse-border text-center text-sm text-fosse-muted">
            Connecte-toi pour commenter
          </div>
        )}
      </div>
    </div>
  )
}
