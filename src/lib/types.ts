export type Visibilite = 'public' | 'amis' | 'prive'
export type StatutConcert = 'vu' | 'a_venir'
export type StatutAmi = 'en_attente' | 'accepte' | 'refuse' | 'bloque'
export type TypeReaction = 'like' | 'feu' | 'coeur'
export type Placement = 'fosse' | 'gradin' | 'balcon' | 'vip' | 'autre'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  bio: string | null
  ville: string | null
  pays: string
  avatar_url: string | null
  genres_favoris: string[]
  visibilite: Visibilite
  created_at: string
  updated_at: string
  nb_concerts?: number
  nb_artistes?: number
  note_moyenne?: number
}

export interface Concert {
  id: string
  user_id: string
  artiste: string
  date_concert: string
  salle: string | null
  ville: string | null
  pays: string
  genre: string | null
  // Journal
  journal: string | null
  humeur_avant: string | null
  humeur_apres: string | null
  avec_qui: string | null
  placement: Placement | null
  moments_cles: string[]
  // Médias
  photos: string[]
  setlist: string[]
  // Notation
  note: number | null
  statut: StatutConcert
  setlistfm_id: string | null
  created_at: string
  updated_at: string
  // Relations
  profiles?: Profile
  reactions?: Reaction[]
  commentaires?: Commentaire[]
  nb_reactions?: number
  nb_commentaires?: number
  user_has_liked?: boolean
}

export interface Ami {
  id: string
  demandeur_id: string
  receveur_id: string
  statut: StatutAmi
  created_at: string
  profiles_demandeur?: Profile
  profiles_receveur?: Profile
}

export interface Reaction {
  id: string
  user_id: string
  concert_id: string
  type: TypeReaction
  created_at: string
  profiles?: Profile
}

export interface Commentaire {
  id: string
  user_id: string
  concert_id: string
  contenu: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export const GENRES_MUSICAUX = [
  'Rock', 'Metal', 'Pop', 'Électro', 'Jazz', 'Hip-Hop', 'Rap',
  'R&B', 'Soul', 'Folk', 'Indie', 'Punk', 'Classique', 'Reggae',
  'Blues', 'Country', 'World', 'Techno', 'House', 'Autres'
]

export const HUMEURS_AVANT = [
  { emoji: '🤩', label: 'Survolté' },
  { emoji: '😊', label: 'Excité' },
  { emoji: '😌', label: 'Serein' },
  { emoji: '😤', label: 'Stressé' },
  { emoji: '🥱', label: 'Fatigué' },
]

export const HUMEURS_APRES = [
  { emoji: '🤯', label: 'Transcendé' },
  { emoji: '🥹', label: 'Ému' },
  { emoji: '😮‍💨', label: 'Comblé' },
  { emoji: '🔥', label: 'Électrisé' },
  { emoji: '😴', label: 'Épuisé' },
  { emoji: '😕', label: 'Déçu' },
]

export const PLACEMENTS: { value: Placement; label: string; icon: string }[] = [
  { value: 'fosse', label: 'Fosse', icon: '⬇' },
  { value: 'gradin', label: 'Gradin', icon: '💺' },
  { value: 'balcon', label: 'Balcon', icon: '🎭' },
  { value: 'vip', label: 'VIP', icon: '👑' },
  { value: 'autre', label: 'Autre', icon: '📍' },
]

export const GENRE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Rock':     { bg: '#ef444415', text: '#f87171', border: '#ef444425' },
  'Metal':    { bg: '#78716c15', text: '#a8a29e', border: '#78716c25' },
  'Pop':      { bg: '#ec489915', text: '#f472b6', border: '#ec489925' },
  'Électro':  { bg: '#ff5c1a15', text: '#ff5c1a', border: '#ff5c1a25' },
  'Jazz':     { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b25' },
  'Hip-Hop':  { bg: '#a78bfa15', text: '#c4b5fd', border: '#a78bfa25' },
  'Rap':      { bg: '#a78bfa15', text: '#c4b5fd', border: '#a78bfa25' },
  'Indie':    { bg: '#22c55e15', text: '#4ade80', border: '#22c55e25' },
  'Folk':     { bg: '#84cc1615', text: '#a3e635', border: '#84cc1625' },
  'Punk':     { bg: '#ef444415', text: '#f87171', border: '#ef444425' },
  'Classique':{ bg: '#06b6d415', text: '#22d3ee', border: '#06b6d425' },
  'default':  { bg: '#ffffff08', text: '#666',    border: '#2a2a2a' },
}
