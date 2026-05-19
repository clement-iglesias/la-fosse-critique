import { NextRequest, NextResponse } from 'next/server'

async function fetchSetlists(params: URLSearchParams, apiKey: string) {
  const res = await fetch(`https://api.setlist.fm/rest/1.0/search/setlists?${params}`, {
    headers: { 'x-api-key': apiKey, 'Accept': 'application/json' },
    next: { revalidate: 3600 },
  })
  if (res.status === 404) return []
  if (!res.ok) return null // erreur réseau
  const data = await res.json()
  return data.setlist ?? []
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const artist = searchParams.get('artist')
  const date = searchParams.get('date')   // YYYY-MM-DD
  const venue = searchParams.get('venue')

  if (!artist) return NextResponse.json({ error: 'Artiste requis' }, { status: 400 })

  const apiKey = process.env.SETLISTFM_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Clé API non configurée' }, { status: 500 })

  // Convertir YYYY-MM-DD → dd-MM-yyyy
  let dateParam = ''
  let year = ''
  if (date) {
    const [y, m, d] = date.split('-')
    if (y && m && d) { dateParam = `${d}-${m}-${y}`; year = y }
  }

  try {
    // --- Stratégie 1 : artiste + date exacte + salle ---
    if (dateParam && venue?.trim()) {
      const p = new URLSearchParams({ artistName: artist, date: dateParam, venueName: venue.trim(), p: '1' })
      const r = await fetchSetlists(p, apiKey)
      if (r && r.length > 0) return NextResponse.json({ setlist: r, strategy: 1 })
    }

    // --- Stratégie 2 : artiste + date exacte (sans salle) ---
    if (dateParam) {
      const p = new URLSearchParams({ artistName: artist, date: dateParam, p: '1' })
      const r = await fetchSetlists(p, apiKey)
      if (r && r.length > 0) return NextResponse.json({ setlist: r, strategy: 2 })
    }

    // --- Stratégie 3 : artiste + année (les 25 premiers résultats, filtrés côté client) ---
    if (year) {
      const p = new URLSearchParams({ artistName: artist, year, p: '1' })
      const r = await fetchSetlists(p, apiKey)
      if (r && r.length > 0) return NextResponse.json({ setlist: r, strategy: 3 })
    }

    // --- Stratégie 4 : artiste seul ---
    const p = new URLSearchParams({ artistName: artist, p: '1' })
    const r = await fetchSetlists(p, apiKey)
    if (r && r.length > 0) return NextResponse.json({ setlist: r, strategy: 4 })

    return NextResponse.json({ setlist: [] })
  } catch {
    return NextResponse.json({ error: 'Erreur réseau' }, { status: 500 })
  }
}
