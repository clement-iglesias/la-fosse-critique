-- ============================================================
-- LA FOSSE CRITIQUE — Schéma de base de données v2
-- À coller dans Supabase > SQL Editor > New query > Run
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- TABLE : profiles
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  full_name text,
  bio text,
  ville text,
  pays text default 'France',
  avatar_url text,
  genres_favoris text[] default '{}',
  visibilite text not null default 'public' check (visibilite in ('public', 'amis', 'prive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index profiles_username_idx on public.profiles using gin(username gin_trgm_ops);

-- ============================================================
-- TABLE : concerts
-- ============================================================
create table public.concerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  -- Infos de base
  artiste text not null,
  date_concert date not null,
  salle text,
  ville text,
  pays text default 'France',
  genre text,
  -- Journal & mémoires
  journal text,
  humeur_avant text,
  humeur_apres text,
  avec_qui text,
  placement text check (placement in ('fosse', 'gradin', 'balcon', 'vip', 'autre')),
  moments_cles text[] default '{}',
  -- Médias
  photos text[] default '{}',
  setlist text[] default '{}',
  -- Notation
  note numeric(3,1) check (note >= 0 and note <= 20),
  -- Statut
  statut text not null default 'vu' check (statut in ('vu', 'a_venir')),
  -- Intégrations externes
  setlistfm_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index concerts_user_id_idx on public.concerts(user_id);
create index concerts_artiste_idx on public.concerts using gin(artiste gin_trgm_ops);
create index concerts_date_idx on public.concerts(date_concert desc);
create index concerts_statut_idx on public.concerts(statut);

-- ============================================================
-- TABLE : amis
-- ============================================================
create table public.amis (
  id uuid default uuid_generate_v4() primary key,
  demandeur_id uuid references public.profiles(id) on delete cascade not null,
  receveur_id uuid references public.profiles(id) on delete cascade not null,
  statut text not null default 'en_attente' check (statut in ('en_attente', 'accepte', 'refuse', 'bloque')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(demandeur_id, receveur_id)
);

create index amis_demandeur_idx on public.amis(demandeur_id);
create index amis_receveur_idx on public.amis(receveur_id);

-- ============================================================
-- TABLE : reactions
-- ============================================================
create table public.reactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  concert_id uuid references public.concerts(id) on delete cascade not null,
  type text not null default 'like' check (type in ('like', 'feu', 'coeur')),
  created_at timestamptz default now(),
  unique(user_id, concert_id)
);

create index reactions_concert_idx on public.reactions(concert_id);

-- ============================================================
-- TABLE : commentaires
-- ============================================================
create table public.commentaires (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  concert_id uuid references public.concerts(id) on delete cascade not null,
  contenu text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index commentaires_concert_idx on public.commentaires(concert_id);

-- ============================================================
-- TABLE : notifications
-- ============================================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  data jsonb default '{}',
  lu boolean default false,
  created_at timestamptz default now()
);

create index notifications_user_idx on public.notifications(user_id, lu);

-- ============================================================
-- TRIGGERS
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function update_updated_at();
create trigger concerts_updated_at before update on public.concerts
  for each row execute function update_updated_at();
create trigger amis_updated_at before update on public.amis
  for each row execute function update_updated_at();

-- ============================================================
-- TRIGGER — création du profil à l'inscription
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)
    ),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.concerts enable row level security;
alter table public.amis enable row level security;
alter table public.reactions enable row level security;
alter table public.commentaires enable row level security;
alter table public.notifications enable row level security;

-- PROFILES
create policy "profiles_select" on public.profiles for select using (
  visibilite = 'public' or auth.uid() = id or (
    visibilite = 'amis' and exists (
      select 1 from public.amis where statut = 'accepte' and (
        (demandeur_id = auth.uid() and receveur_id = id) or
        (receveur_id = auth.uid() and demandeur_id = id)
      )
    )
  )
);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete" on public.profiles for delete using (auth.uid() = id);

-- CONCERTS
create policy "concerts_select" on public.concerts for select using (
  exists (
    select 1 from public.profiles p where p.id = concerts.user_id and (
      p.visibilite = 'public' or auth.uid() = p.id or (
        p.visibilite = 'amis' and exists (
          select 1 from public.amis where statut = 'accepte' and (
            (demandeur_id = auth.uid() and receveur_id = p.id) or
            (receveur_id = auth.uid() and demandeur_id = p.id)
          )
        )
      )
    )
  )
);
create policy "concerts_insert" on public.concerts for insert with check (auth.uid() = user_id);
create policy "concerts_update" on public.concerts for update using (auth.uid() = user_id);
create policy "concerts_delete" on public.concerts for delete using (auth.uid() = user_id);

-- AMIS
create policy "amis_select" on public.amis for select using (auth.uid() = demandeur_id or auth.uid() = receveur_id);
create policy "amis_insert" on public.amis for insert with check (auth.uid() = demandeur_id);
create policy "amis_update" on public.amis for update using (auth.uid() = demandeur_id or auth.uid() = receveur_id);
create policy "amis_delete" on public.amis for delete using (auth.uid() = demandeur_id or auth.uid() = receveur_id);

-- REACTIONS
create policy "reactions_select" on public.reactions for select using (true);
create policy "reactions_insert" on public.reactions for insert with check (auth.uid() = user_id);
create policy "reactions_delete" on public.reactions for delete using (auth.uid() = user_id);

-- COMMENTAIRES
create policy "commentaires_select" on public.commentaires for select using (true);
create policy "commentaires_insert" on public.commentaires for insert with check (auth.uid() = user_id);
create policy "commentaires_update" on public.commentaires for update using (auth.uid() = user_id);
create policy "commentaires_delete" on public.commentaires for delete using (auth.uid() = user_id);

-- NOTIFICATIONS
create policy "notifications_select" on public.notifications for select using (auth.uid() = user_id);
create policy "notifications_update" on public.notifications for update using (auth.uid() = user_id);

-- ============================================================
-- STORAGE
-- ============================================================
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('concerts', 'concerts', true) on conflict do nothing;

create policy "avatars_select" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_insert" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "concerts_photos_select" on storage.objects for select using (bucket_id = 'concerts');
create policy "concerts_photos_insert" on storage.objects for insert
  with check (bucket_id = 'concerts' and auth.uid()::text = (storage.foldername(name))[1]);
