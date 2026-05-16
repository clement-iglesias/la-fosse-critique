import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'La Fosse Critique',
  description: 'Répertorie, note et partage les concerts auxquels tu as assisté.',
  keywords: ['concerts', 'musique', 'notes', 'setlist', 'journal'],
  openGraph: {
    title: 'La Fosse Critique',
    description: 'Ton journal de concerts personnel',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-fosse-bg text-fosse-text antialiased">
        {children}
      </body>
    </html>
  )
}
