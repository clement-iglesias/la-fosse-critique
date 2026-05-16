'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Download, Share2, Mic2 } from 'lucide-react'
import { Concert, GENRE_COLORS } from '@/lib/types'

interface StoryGeneratorProps {
  concert: Concert
  onClose: () => void
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

function getNoteColor(note: number) {
  if (note >= 16) return '#4ade80'
  if (note >= 12) return '#ff5c1a'
  if (note >= 8) return '#fbbf24'
  return '#f87171'
}

export default function StoryGenerator({ concert, onClose }: StoryGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rendered, setRendered] = useState(false)
  const [progress, setProgress] = useState(0)

  const genreStyle = GENRE_COLORS[concert.genre ?? ''] ?? GENRE_COLORS['default']
  const noteColor = concert.note ? getNoteColor(concert.note) : '#ff5c1a'

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1080
    canvas.height = 1920

    // Fond
    ctx.fillStyle = '#080808'
    ctx.fillRect(0, 0, 1080, 1920)

    // Texture subtile — grille de points
    ctx.fillStyle = '#ffffff04'
    for (let x = 0; x < 1080; x += 48) {
      for (let y = 0; y < 1920; y += 48) {
        ctx.beginPath()
        ctx.arc(x, y, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Glow orange en haut
    const glow = ctx.createRadialGradient(540, 0, 0, 540, 0, 600)
    glow.addColorStop(0, '#ff5c1a18')
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, 1080, 1200)

    // Barre de progression (simulée à 80%)
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.roundRect(60, 80, 960, 6, 3)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.roundRect(60, 80, 768, 6, 3)
    ctx.fill()

    // Genre badge
    ctx.fillStyle = genreStyle.bg
    ctx.strokeStyle = genreStyle.border
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(60, 140, 200, 48, 24)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = genreStyle.text
    ctx.font = '600 22px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(concert.genre ?? 'Concert', 160, 170)

    // Artiste
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 120px Inter, system-ui, sans-serif'
    ctx.textAlign = 'left'
    const artistText = concert.artiste.toUpperCase()
    ctx.fillText(artistText, 60, 380, 960)

    // Sous-infos
    ctx.fillStyle = '#444444'
    ctx.font = '500 32px Inter, system-ui, sans-serif'
    const metaLine = [
      formatDate(concert.date_concert),
      [concert.salle, concert.ville].filter(Boolean).join(', ')
    ].filter(Boolean).join('  ·  ')
    ctx.fillText(metaLine, 60, 440)

    // Note
    ctx.fillStyle = noteColor + '18'
    ctx.strokeStyle = noteColor + '30'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(60, 520, 320, 200, 20)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = noteColor
    ctx.font = '900 140px Inter, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(concert.note?.toString() ?? '—', 220, 660)
    ctx.fillStyle = '#333'
    ctx.font = '500 32px Inter, system-ui, sans-serif'
    ctx.fillText('/20', 220, 710)

    // Humeur
    if (concert.humeur_avant || concert.humeur_apres) {
      ctx.fillStyle = '#141414'
      ctx.strokeStyle = '#1e1e1e'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(420, 520, 600, 80, 12)
      ctx.fill()
      ctx.stroke()

      ctx.font = '500 34px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      const humeurText = [concert.humeur_avant, concert.humeur_apres].filter(Boolean).join('  →  ')
      ctx.fillStyle = '#555'
      ctx.fillText(humeurText, 720, 572)
    }

    // Séparateur
    ctx.strokeStyle = '#1e1e1e'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, 760)
    ctx.lineTo(1020, 760)
    ctx.stroke()

    // Journal / Citation
    if (concert.journal) {
      ctx.fillStyle = '#ff5c1a30'
      ctx.fillRect(60, 800, 4, 200)

      ctx.fillStyle = '#666666'
      ctx.font = 'italic 36px Inter, system-ui, sans-serif'
      ctx.textAlign = 'left'
      const quoteText = `"${concert.journal}"`
      const words = quoteText.split(' ')
      let line = ''
      let y = 850
      for (const word of words) {
        const test = line + word + ' '
        if (ctx.measureText(test).width > 900 && line !== '') {
          ctx.fillText(line.trim(), 84, y)
          line = word + ' '
          y += 52
          if (y > 1050) { ctx.fillText('...', 84, y); break }
        } else { line = test }
      }
      if (y <= 1050) ctx.fillText(line.trim(), 84, y)
    }

    // Moments clés
    if (concert.moments_cles?.length) {
      let my = 1100
      ctx.fillStyle = '#ff5c1a'
      ctx.font = '700 24px Inter, system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText('✦', 60, my)

      ctx.fillStyle = '#444'
      ctx.font = '400 28px Inter, system-ui, sans-serif'
      const moment = concert.moments_cles[0]
      ctx.fillText(moment.length > 60 ? moment.slice(0, 57) + '...' : moment, 96, my)
    }

    // Placement badge
    if (concert.placement) {
      const labels: Record<string, string> = { fosse: '⬇ Fosse', gradin: '💺 Gradin', balcon: '🎭 Balcon', vip: '👑 VIP', autre: '📍 Autre' }
      ctx.fillStyle = '#141414'
      ctx.strokeStyle = '#1e1e1e'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(420, 540, 200, 52, 26)
      ctx.fill()
      ctx.stroke()
      ctx.fillStyle = '#555'
      ctx.font = '600 24px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(labels[concert.placement] ?? concert.placement, 520, 573)
    }

    // Logo watermark
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.roundRect(60, 1800, 400, 80, 12)
    ctx.fill()
    ctx.fillStyle = '#ff5c1a'
    ctx.font = '700 28px Inter, system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('La Fosse Critique', 90, 1848)
    ctx.fillStyle = '#333'
    ctx.font = '400 22px Inter, system-ui, sans-serif'
    ctx.fillText('lafosse.app', 90, 1876)

    setRendered(true)
  }, [concert])

  // Barre de progression animée
  useEffect(() => {
    if (!rendered) return
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + 1
      })
    }, 50)
    return () => clearInterval(interval)
  }, [rendered])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `fosse-critique-${concert.artiste.toLowerCase().replace(/\s+/g, '-')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      canvas.toBlob(async blob => {
        if (!blob) return
        const file = new File([blob], 'story.png', { type: 'image/png' })
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: `${concert.artiste} — La Fosse Critique` })
        } else {
          handleDownload()
        }
      }, 'image/png')
    } catch { handleDownload() }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative max-h-screen overflow-y-auto">
        {/* Barre de fermeture */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-fosse-muted">Story générée</div>
          <button onClick={onClose} className="text-fosse-muted hover:text-white p-1 rounded-lg hover:bg-fosse-card">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas story (aperçu 50%) */}
        <div className="relative" style={{ width: 270, height: 480 }}>
          {/* Barre de progression simulée */}
          <div className="absolute top-3 left-3 right-3 z-10">
            <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover rounded-2xl border border-fosse-border"
            style={{ display: 'block' }}
          />

          {!rendered && (
            <div className="absolute inset-0 flex items-center justify-center bg-fosse-bg rounded-2xl">
              <div className="flex flex-col items-center gap-2">
                <Mic2 className="w-8 h-8 text-fosse-orange animate-pulse" />
                <div className="text-xs text-fosse-muted">Génération en cours...</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            disabled={!rendered}
            className="flex-1 flex items-center justify-center gap-2 btn-secondary py-3 text-sm disabled:opacity-40"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>
          <button
            onClick={handleShare}
            disabled={!rendered}
            className="flex-1 flex items-center justify-center gap-2 btn-primary py-3 text-sm disabled:opacity-40"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>
    </div>
  )
}
