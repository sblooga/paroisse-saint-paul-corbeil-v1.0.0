## Migration Supabase -> Backend/Neon (plan de travail)

1) Audit des usages Supabase (front)
- Localiser tous les import/usage de `supabase` (auth, stockage, RPC).
- Fichiers principaux : `hooks/useAuth.tsx`, pages publiques (Articles, PageView, Contact, FAQ, Downloads, Team/LifeStages/Schedules), admin (`Admin*.tsx`), composants partagés (`SearchDialog`, `Footer`, `image-upload`, `rich-text-editor`), edge function `supabase/functions/list-users`.

2) Schéma backend/Neon à compléter si besoin
- Vérifier que Prisma/Neon couvre : articles, pages, FAQ, messages de contact, newsletter, team, masses, liens footer, life stages, docs password, users/roles.
- Ajouter migrations Prisma si des tables manquent ou colonnes nécessaires.

3) Migration des données Supabase -> Neon
- Exporter les tables Supabase utilisées.
- Importer dans Neon (SQL ou script) en respectant le schéma Prisma (slugs uniques, rôles, etc.).

4) Auth unifiée (backend JWT)
- Créer un hook `useBackendAuth` (login/logout, stockage token, `/api/auth/me`).
- Remplacer `useAuth`/Supabase dans l’admin et les routes protégées.
- Gérer les rôles ADMIN/EDITOR via le token backend.

5) Remplacer les appels Supabase par l’API backend
- Pages publiques : articles, article detail, pages statiques, FAQ, team, horaires, life stages, footer, downloads/docs password, search, contact (form), newsletter.
- Admin : articles, pages, FAQ, messages, newsletter, team, masses, footer links, life stages, docs password, users.
- Uploads : remplacer Supabase storage par endpoint backend/Cloudinary (image + audio déjà en place).

6) Nettoyage et env
- Retirer `supabase` des deps front, supprimer `VITE_SUPABASE_*` et edge functions Supabase si non utilisées.
- Mettre à jour `.env(.local)` front : `VITE_API_URL` uniquement.
- Mettre à jour README/diagnostics.

7) Tests
- Local : parcours complet admin (login, CRUD) et public (liste articles, pages, FAQ, contact/newsletter, search).
- Vérifier que toute écriture/lecture passe par backend/Neon.
- Déploiement Render frontend + backend.
