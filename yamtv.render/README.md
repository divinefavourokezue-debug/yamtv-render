# YAM TV - Portail d'Information

Application développée avec React, Vite, TailwindCSS et Supabase.

## Prérequis
- Node.js (v18+)
- Compte Supabase

## Instructions d'installation de Supabase

1. Créez un projet sur [Supabase](https://supabase.com).
2. Dans "Project Settings" -> "API", copiez l'URL du projet et la clé anonyme (anon key).
3. Renommez le fichier `.env.example` en `.env` (ou créez-en un) et collez vos clés:
   ```
   VITE_SUPABASE_URL=votre_url
   VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
   ```
4. Dans le SQL Editor de Supabase, exécutez le script suivant pour créer la table `articles` :
   ```sql
   create table articles (
     id uuid default uuid_generate_v4() primary key,
     title_fr text not null,
     title_en text,
     slug text not null unique,
     category text not null,
     excerpt_fr text,
     excerpt_en text,
     content_fr text,
     content_en text,
     featured_image_url text,
     published_at timestamp with time zone default timezone('utc'::text, now()),
     is_published boolean default false
   );
   
   -- Policies for articles (Public read, Authenticated write)
   alter table articles enable row level security;
   
   create policy "Public articles are viewable by everyone." on articles
     for select using (true);
     
   create policy "Articles can be created by authenticated users." on articles
     for insert with check (auth.role() = 'authenticated');
     
   create policy "Articles can be updated by authenticated users." on articles
     for update using (auth.role() = 'authenticated');
     
   create policy "Articles can be deleted by authenticated users." on articles
     for delete using (auth.role() = 'authenticated');
   ```

5. Créez un bucket Storage nommé `yam-tv-media` dans Supabase Storage. Rendez-le public en cochant "Public bucket".
6. Ajoutez les politiques de sécurité (RLS) pour le bucket :
   - Lecture : public
   - Écriture/Modification/Suppression : `authenticated`

7. Créez un utilisateur administrateur dans Supabase "Authentication" -> "Users" avec une adresse e-mail et un mot de passe. Vous utiliserez ces identifiants pour vous connecter à `/admin`.

## Lancement
```bash
npm install
npm run dev
```

L'application utilisera des données de démonstration locales si les variables Supabase ne sont pas configurées.
