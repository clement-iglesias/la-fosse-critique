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
  genres: string[]
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
  top_morceaux: string[]
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

export const GENRES_PAR_CATEGORIE = [
  {
    categorie: '🤘 Metal',
    genres: [
      'Heavy Metal', 'Thrash Metal', 'Death Metal', 'Black Metal', 'Doom Metal',
      'Power Metal', 'Progressive Metal', 'Nu-Metal', 'Metalcore', 'Deathcore',
      'Folk Metal', 'Symphonic Metal', 'Industrial Metal', 'Stoner Metal',
      'Sludge Metal', 'Speed Metal', 'Groove Metal', 'Gothic Metal', 'Grindcore',
    ],
  },
  {
    categorie: '🎸 Rock',
    genres: [
      'Rock Classique', 'Hard Rock', 'Alternative', 'Indie Rock', 'Punk Rock',
      'Grunge', 'Post-Rock', 'Psychédélique', 'Garage Rock', 'Blues Rock',
      'Southern Rock', 'Shoegaze', 'Noise Rock', 'Post-Punk', 'New Wave', 'Emo',
    ],
  },
  {
    categorie: '🎛️ Électronique',
    genres: [
      'Électro', 'Techno', 'House', 'Trance', 'Drum & Bass', 'Dubstep',
      'Ambient', 'IDM', 'EBM', 'Industrial', 'Hardcore Techno', 'Gabber', 'Jungle',
    ],
  },
  {
    categorie: '🎤 Hip-Hop / Urban',
    genres: ['Hip-Hop', 'Rap', 'Trap', 'R&B', 'Soul', 'Funk', 'Reggaeton', 'Afrobeat'],
  },
  {
    categorie: '🎷 Jazz / Blues',
    genres: ['Jazz', 'Blues', 'Soul', 'Funk', 'Gospel', 'Jazz Fusion', 'Swing', 'Bebop'],
  },
  {
    categorie: '🎵 Autres',
    genres: [
      'Pop', 'Folk', 'Classique', 'Reggae', 'Country', 'World', 'Punk',
      'Expérimental', 'Noise', 'Chanson Française', 'Flamenco', 'Celtic',
    ],
  },
]

export const GENRES_MUSICAUX = GENRES_PAR_CATEGORIE.flatMap(c => c.genres)

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
  // Metal
  'Heavy Metal':       { bg: '#78716c15', text: '#a8a29e', border: '#78716c30' },
  'Thrash Metal':      { bg: '#ef444415', text: '#f87171', border: '#ef444430' },
  'Death Metal':       { bg: '#1c1917aa', text: '#78716c', border: '#44403c30' },
  'Black Metal':       { bg: '#09090b20', text: '#71717a', border: '#3f3f4630' },
  'Doom Metal':        { bg: '#44403c15', text: '#78716c', border: '#57534e30' },
  'Power Metal':       { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b30' },
  'Progressive Metal': { bg: '#8b5cf615', text: '#a78bfa', border: '#8b5cf630' },
  'Nu-Metal':          { bg: '#6b21a815', text: '#c084fc', border: '#7c3aed30' },
  'Metalcore':         { bg: '#ef444415', text: '#f87171', border: '#dc262630' },
  'Deathcore':         { bg: '#1c191720', text: '#78716c', border: '#3f3f4630' },
  'Folk Metal':        { bg: '#84cc1615', text: '#a3e635', border: '#65a30d30' },
  'Symphonic Metal':   { bg: '#7c3aed15', text: '#c4b5fd', border: '#7c3aed30' },
  'Industrial Metal':  { bg: '#374151aa', text: '#9ca3af', border: '#4b556330' },
  'Stoner Metal':      { bg: '#92400e15', text: '#d97706', border: '#b4530930' },
  'Sludge Metal':      { bg: '#78716c20', text: '#a8a29e', border: '#57534e30' },
  'Speed Metal':       { bg: '#dc262615', text: '#f87171', border: '#ef444430' },
  'Groove Metal':      { bg: '#78716c15', text: '#d6d3d1', border: '#78716c30' },
  'Gothic Metal':      { bg: '#4c1d9515', text: '#a78bfa', border: '#6d28d930' },
  'Grindcore':         { bg: '#7f1d1d15', text: '#fca5a5', border: '#dc262630' },
  // Rock
  'Rock Classique':    { bg: '#ef444415', text: '#f87171', border: '#ef444425' },
  'Hard Rock':         { bg: '#dc262615', text: '#fca5a5', border: '#ef444425' },
  'Alternative':       { bg: '#6b728015', text: '#9ca3af', border: '#4b556325' },
  'Indie Rock':        { bg: '#22c55e15', text: '#4ade80', border: '#22c55e25' },
  'Punk Rock':         { bg: '#ef444415', text: '#f87171', border: '#ef444425' },
  'Grunge':            { bg: '#78716c15', text: '#a8a29e', border: '#78716c25' },
  'Post-Rock':         { bg: '#06b6d415', text: '#22d3ee', border: '#06b6d425' },
  'Psychédélique':     { bg: '#ec489915', text: '#f472b6', border: '#ec489925' },
  'Garage Rock':       { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b25' },
  'Blues Rock':        { bg: '#1d4ed815', text: '#60a5fa', border: '#3b82f625' },
  'Southern Rock':     { bg: '#92400e15', text: '#d97706', border: '#b4530925' },
  'Shoegaze':          { bg: '#7c3aed15', text: '#c4b5fd', border: '#8b5cf625' },
  'Noise Rock':        { bg: '#37415115', text: '#9ca3af', border: '#4b556325' },
  'Post-Punk':         { bg: '#4c1d9515', text: '#a78bfa', border: '#6d28d925' },
  'New Wave':          { bg: '#ec489915', text: '#f472b6', border: '#db277725' },
  'Emo':               { bg: '#1e293b15', text: '#94a3b8', border: '#33415525' },
  // Électronique
  'Électro':           { bg: '#ff5c1a15', text: '#ff5c1a', border: '#ff5c1a25' },
  'Techno':            { bg: '#37415115', text: '#e5e7eb', border: '#6b728025' },
  'House':             { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b25' },
  'Trance':            { bg: '#8b5cf615', text: '#a78bfa', border: '#8b5cf625' },
  'Drum & Bass':       { bg: '#ef444415', text: '#f87171', border: '#ef444425' },
  'Dubstep':           { bg: '#7c3aed15', text: '#c4b5fd', border: '#7c3aed25' },
  'Ambient':           { bg: '#06b6d415', text: '#67e8f9', border: '#0891b225' },
  'IDM':               { bg: '#6b728015', text: '#9ca3af', border: '#4b556325' },
  'EBM':               { bg: '#37415115', text: '#d1d5db', border: '#4b556325' },
  'Industrial':        { bg: '#37415120', text: '#9ca3af', border: '#4b556325' },
  'Hardcore Techno':   { bg: '#dc262615', text: '#fca5a5', border: '#ef444425' },
  'Gabber':            { bg: '#7f1d1d15', text: '#fca5a5', border: '#dc262625' },
  'Jungle':            { bg: '#14532d15', text: '#4ade80', border: '#16a34a25' },
  // Hip-Hop
  'Hip-Hop':           { bg: '#a78bfa15', text: '#c4b5fd', border: '#a78bfa25' },
  'Rap':               { bg: '#a78bfa15', text: '#c4b5fd', border: '#a78bfa25' },
  'Trap':              { bg: '#6d28d915', text: '#c084fc', border: '#7c3aed25' },
  'R&B':               { bg: '#ec489915', text: '#f472b6', border: '#ec489925' },
  'Soul':              { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b25' },
  'Funk':              { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b25' },
  'Reggaeton':         { bg: '#22c55e15', text: '#4ade80', border: '#22c55e25' },
  'Afrobeat':          { bg: '#f59e0b20', text: '#fbbf24', border: '#f59e0b30' },
  // Jazz / Blues
  'Jazz':              { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b25' },
  'Blues':             { bg: '#1d4ed815', text: '#60a5fa', border: '#3b82f625' },
  'Gospel':            { bg: '#f59e0b15', text: '#fde68a', border: '#f59e0b25' },
  'Jazz Fusion':       { bg: '#f59e0b15', text: '#fbbf24', border: '#f59e0b25' },
  'Swing':             { bg: '#f59e0b15', text: '#fbbf24', border: '#d9770625' },
  'Bebop':             { bg: '#92400e15', text: '#d97706', border: '#b4530925' },
  // Autres
  'Pop':               { bg: '#ec489915', text: '#f472b6', border: '#ec489925' },
  'Folk':              { bg: '#84cc1615', text: '#a3e635', border: '#84cc1625' },
  'Classique':         { bg: '#06b6d415', text: '#22d3ee', border: '#06b6d425' },
  'Reggae':            { bg: '#22c55e15', text: '#4ade80', border: '#22c55e25' },
  'Country':           { bg: '#92400e15', text: '#d97706', border: '#b4530925' },
  'World':             { bg: '#14532d15', text: '#4ade80', border: '#16a34a25' },
  'Punk':              { bg: '#ef444415', text: '#f87171', border: '#ef444425' },
  'Expérimental':      { bg: '#37415115', text: '#9ca3af', border: '#4b556325' },
  'Noise':             { bg: '#1c191720', text: '#78716c', border: '#3f3f4625' },
  'Chanson Française': { bg: '#1d4ed815', text: '#93c5fd', border: '#3b82f625' },
  'Flamenco':          { bg: '#dc262615', text: '#fca5a5', border: '#ef444425' },
  'Celtic':            { bg: '#14532d15', text: '#86efac', border: '#16a34a25' },
  'Metal':             { bg: '#78716c15', text: '#a8a29e', border: '#78716c25' },
  'Rock':              { bg: '#ef444415', text: '#f87171', border: '#ef444425' },
  'Indie':             { bg: '#22c55e15', text: '#4ade80', border: '#22c55e25' },
  'default':           { bg: '#ffffff08', text: '#666',    border: '#2a2a2a' },
}
