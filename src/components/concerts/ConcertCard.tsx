'use client'

import { useState } from 'react'
import { Concert, GENRE_COLORS } from '@/lib/types'
import { Calendar, MapPin, Users, MessageCircle, Share2, Sparkles, ChevronDown, ChevronUp, Pencil, Music } from 'lucide-react'
import Link from 'next/link'
import LikeButton from './LikeButton'
import CommentSheet from './CommentSheet'
import StoryGenerator from './StoryGenerator'

interface ConcertCardProps {
  concert: Concert
  userId: string | null
  onDelete?: (id: string) => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function NoteDisplay({ note }: { note: number | null }) {
  if (note === null) return null
  const color = note >= 16 ? 'text-green-400 border-green-400/20 bg-green-400/8'
    : note >= 12 ? 'text-fosse-orange border-fosse-orange/20 bg-fosse-orange/8'
    : note >= 8 ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/8'
    : 'text-red-400 border-red-400/20 bg-red-400/8'
  return (
    <div className={`inline-flex items-baseline gap-0.5 px-3 py-1.5 rounded-xl border font-black ${color}`}>
      <span className="text-2xl leading-none">{note}</span>
      <span className="text-xs opacity-50">/20</span>
    </div>
  )
}

export default function ConcertCard({ concert, userId, onDelete }: ConcertCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showSetlist, setShowSetlist] = useState(false)
  const isAVenir = concert.statut === 'a_venir'

  // Support both new genres[] and legacy genre field
  const displayGenres: string[] = (Array.isArray(concert.genres) && concert.genres.length > 0)
    ? concert.genres
    : (concert.genre ? [concert.genre] : [])

  const hasJournal = !!concert.journal
  const hasMoments = concert.moments_cles?.length > 0
  const hasExtras = hasJournal || hasMoments || concert.avec_qui || concert.placement

  const nbLikes = concert.nb_reactions ?? concert.reactions?.length ?? 0
  const nbComments = concert.nb_commentaires ?? concert.commentaires?.length ?? 0
  const userHasLiked = concert.user_has_liked ?? false

  return (
    <>
      <article className={`bg-fosse-bg border rounded-2xl overflow-hidden transition-colors hover:border-fosse-border ${
        isAVenir ? 'border-fosse-amber/20' : 'border-fosse-card'
      }`}>
        {/* Hero */}
        <div className="relative h-20 overflow-hidden flex items-end px-4 pb-3 bg-fosse-surface">
          <div className="absolute inset-0 flex items-center justify-start pl-4 overflow-hidden select-none pointer-events-none">
            <span className="text-6xl font-black text-white/[0.04] whitespace-nowrap tracking-tight uppercase">
              {concert.artiste}
            </span>
          </div>

          {/* Genre tags */}
          {displayGenres.length > 0 && (
            <div className="absolute top-3 right-3 flex gap-1 flex-wrap justify-end max-w-[60%]">
              {displayGenres.slice(0, 2).map(g => {
                const gs = GENRE_COLORS[g] ?? GENRE_COLORS['default']
                return (
                  <span
                    key={g}
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase"
                    style={{ background: gs.bg, color: gs.text, border: `1px solid ${gs.border}` }}
                  >
                    {g}
                  </span>
                )
              })}
              {displayGenres.length > 2 && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-fosse-card border border-fosse-border text-fosse-muted">
                  +{displayGenres.length - 2}
                </span>
              )}
            </div>
          )}

          {isAVenir && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-fosse-amber/10 text-fosse-amber border border-fosse-amber/25">
              J&apos;y serai
            </div>
          )}

          <div className="relative z-10 flex items-end justify-between w-full">
            <h3 className="text-xl font-black text-white tracking-tight leading-none">{concert.artiste}</h3>
            {!isAVenir && <NoteDisplay note={concert.note} />}
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pt-3 pb-0">
          <div className="flex flex-wrap gap-3 text-xs text-fosse-muted mb-2.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{formatDate(concert.date_concert)}
            </span>
            {(concert.salle || concert.ville) && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[concert.salle, concert.ville].filter(Boolean).join(' — ')}
              </span>
            )}
            {concert.avec_qui && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />{concert.avec_qui}
              </span>
            )}
            {concert.placement && (
              <span className="text-fosse-muted capitalize">{concert.placement}</span>
            )}
          </div>

          {(concert.humeur_avant || concert.humeur_apres) && (
            <div className="flex items-center gap-2 mb-3">
              {concert.humeur_avant && (
                <span className="px-2 py-1 rounded-full text-xs bg-fosse-card border border-fosse-border text-fosse-muted">
                  {concert.humeur_avant}
                </span>
              )}
              {concert.humeur_avant && concert.humeur_apres && (
                <span className="text-fosse-border text-xs">→</span>
              )}
              {concert.humeur_apres && (
                <span className="px-2 py-1 rounded-full text-xs bg-fosse-card border border-fosse-orange/20 text-fosse-orange">
                  {concert.humeur_apres}
                </span>
              )}
            </div>
          )}

          {hasJournal && (
            <div className="relative mb-3 px-3 py-2.5 bg-fosse-surface rounded-xl border-l-2 border-fosse-orange/30">
              <span className="absolute top-0 left-2 text-3xl text-fosse-orange/20 font-black leading-none select-none">&ldquo;</span>
              <p className={`text-sm text-fosse-muted italic leading-relaxed pl-2 ${!expanded && 'line-clamp-3'}`}>
                {concert.journal}
              </p>
            </div>
          )}

          {hasMoments && expanded && (
            <div className="mb-3 space-y-1.5">
              {concert.moments_cles.map((m, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-fosse-muted">
                  <span className="text-fosse-orange mt-0.5 text-[9px] shrink-0">✦</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          )}

          {hasExtras && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] text-fosse-border hover:text-fosse-muted mb-3 transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? 'Réduire' : `Voir ${hasMoments ? concert.moments_cles.length + ' moment(s) · ' : ''}plus`}
            </button>
          )}

          {concert.setlist?.length > 0 && (
            <div className="mb-3">
              {/* Top 3 always visible if defined */}
              {concert.top_morceaux?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {concert.top_morceaux.map((s, i) => {
                    const medals = ['🥇', '🥈', '🥉']
                    const colors = [
                      'border-yellow-400/40 bg-yellow-400/8 text-yellow-300',
                      'border-slate-400/40 bg-slate-400/8 text-slate-300',
                      'border-amber-600/40 bg-amber-600/8 text-amber-400',
                    ]
                    return (
                      <span key={i} className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${colors[i]}`}>
                        {medals[i]} {s}
                      </span>
                    )
                  })}
                </div>
              )}
              <button
                onClick={() => setShowSetlist(!showSetlist)}
                className="flex items-center gap-1.5 text-[10px] text-fosse-border hover:text-fosse-muted transition-colors"
              >
                <Music className="w-3 h-3" />
                {showSetlist ? 'Masquer la setlist' : `Setlist · ${concert.setlist.length} titres`}
                {showSetlist ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showSetlist && (
                <ol className="mt-2 space-y-1 pl-1">
                  {concert.setlist.map((titre, i) => {
                    const topRank = concert.top_morceaux?.indexOf(titre) ?? -1
                    const medals = ['🥇', '🥈', '🥉']
                    return (
                      <li key={i} className={`flex items-baseline gap-2 text-xs ${topRank !== -1 ? 'text-white font-semibold' : 'text-fosse-muted'}`}>
                        <span className="tabular-nums w-5 shrink-0 text-right">
                          {topRank !== -1 ? medals[topRank] : <span className="text-fosse-border">{i + 1}.</span>}
                        </span>
                        <span>{titre}</span>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>
          )}
        </div>

        {/* Actions bar */}
        <div className="flex items-center border-t border-fosse-surface px-2 py-1">
          <LikeButton
            concertId={concert.id}
            initialCount={nbLikes}
            initialLiked={userHasLiked}
            userId={userId}
          />

          <button
            onClick={() => setShowComments(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-fosse-muted hover:text-fosse-text hover:bg-fosse-card transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{nbComments}</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `${concert.artiste} — La Fosse Critique`, url: window.location.href })
              } else {
                navigator.clipboard?.writeText(window.location.href)
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-fosse-muted hover:text-fosse-text hover:bg-fosse-card transition-all"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <div className="flex-1" />

          {!isAVenir && (
            <button
              onClick={() => setShowStory(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-fosse-orange text-white hover:bg-fosse-orange-dim transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Story
            </button>
          )}

          {userId === concert.user_id && (
            <Link
              href={`/concerts/${concert.id}/modifier`}
              className="ml-1 px-2 py-2 rounded-lg text-fosse-border hover:text-fosse-orange hover:bg-fosse-orange/10 transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Link>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(concert.id)}
              className="ml-1 px-2 py-2 rounded-lg text-xs text-fosse-border hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              ✕
            </button>
          )}
        </div>
      </article>

      {showComments && (
        <CommentSheet
          concertId={concert.id}
          concertLabel={`${concert.artiste} · ${formatDate(concert.date_concert)}`}
          userId={userId}
          onClose={() => setShowComments(false)}
        />
      )}
      {showStory && (
        <StoryGenerator concert={concert} onClose={() => setShowStory(false)} />
      )}
    </>
  )
}
