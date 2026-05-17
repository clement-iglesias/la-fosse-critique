import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const artist = searchParams.get('artist')
  const date = searchParams.get('date') // format YYYY-MM-DD
  const venue = searchParams.get('venue')

  if (!artist) {
    return NextResponse.json({ error: 'Artiste requis' }, { status: 400 })
  }

  const apiKey = process.env.SETLISTFM_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Clé API non configurée' }, { status: 500 })
  }

  // Convertir date de YYYY-MM-DD vers dd-MM-yyyy (format setlist.fm)
  let dateParam = ''
  if (date) {
    const [y, m, d] = date.split('-')
    if (y && m && d) dateParam = `${d}-${m}-${y}`
  }

  const params = new URLSearchParams({ artistName: artist, p: '1' })
  if (dateParam) params.set('date', dateParam)
  if (venue) params.set('venueName', venue)

  try {
    const res = await fetch(`https://api.setlist.fm/rest/1.0/search/setlists?${params}`, {
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    })

    if (res.status === 404) {
      return NextResponse.json({ setlist: [] })
    }

    if (!res.ok) {
      return NextResponse.json({ error: `Erreur setlist.fm (${res.status})` }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erreur réseau' }, { status: 500 })
  }
}
