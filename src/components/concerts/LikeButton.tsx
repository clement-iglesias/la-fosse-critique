'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LikeButtonProps {
  concertId: string
  initialCount: number
  initialLiked: boolean
  userId: string | null
}

export default function LikeButton({ concertId, initialCount, initialLiked, userId }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const toggle = async () => {
    if (!userId || loading) return
    setLoading(true)

    if (liked) {
      await supabase.from('reactions').delete()
        .eq('user_id', userId).eq('concert_id', concertId)
      setLiked(false)
      setCount(c => c - 1)
    } else {
      await supabase.from('reactions').upsert({
        user_id: userId, concert_id: concertId, type: 'like'
      })
      setLiked(true)
      setCount(c => c + 1)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={!userId}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
        liked
          ? 'text-fosse-orange bg-fosse-orange/10'
          : 'text-fosse-muted hover:text-fosse-text hover:bg-fosse-card'
      } disabled:opacity-40`}
      aria-label={liked ? 'Retirer le like' : 'Liker ce concert'}
    >
      <Heart className={`w-4 h-4 transition-transform ${liked ? 'fill-current scale-110' : ''}`} />
      <span>{count}</span>
    </button>
  )
}
