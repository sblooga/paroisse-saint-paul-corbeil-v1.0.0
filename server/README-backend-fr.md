# API backend — paroisse-saint-paul (FR)

## Variables d'environnement (Render Web Service)
- `DATABASE_URL` (Neon)
- `JWT_SECRET` (secret fort)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_ROLE=ADMIN`, `ADMIN_FORCE_RESET=false`
- `CORS_ORIGINS` (liste d'origines front, séparées par des virgules)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER` (optionnel, défaut `paroisse-saint-paul`)
- `NODE_ENV=production`

## Auth
- Login: `POST /api/auth/login` avec `{ email, password }` → `{ token, user }`
- Utiliser `Authorization: Bearer <token>` pour toutes les routes admin.

## Routes publiques
- `GET /api/health` → `{ status: 'ok' }`
- `GET /api/articles` → articles publiés (tri desc `createdAt`)
- `GET /api/team` → membres actifs (tri asc `order`)
- `GET /api/schedules` → messes actives (tri asc `order`)

## Routes admin (JWT + rôle ADMIN requis)
Articles (`/api/articles`)
- `GET /all` : liste complète
- `POST /` : créer (champs obligatoires: `title_fr`, `slug`)
- `PUT /:id` : mettre à jour
- `DELETE /:id` : supprimer

Équipe (`/api/team`)
- `GET /all`
- `POST /` (obligatoire: `name`, `role_fr`, `category`)
- `PUT /:id`
- `DELETE /:id`

Horaires (`/api/schedules`)
- `GET /all`
- `POST /` (obligatoire: `day_fr`, `time`)
- `PUT /:id`
- `DELETE /:id`

Upload images Cloudinary (`/api/uploads`)
- `POST /` avec un champ fichier `file` (multipart/form-data) → `{ url, publicId }`
- `DELETE /:publicId` : supprime l'image Cloudinary

Notes
- Les routes admin renvoient 401 si token manquant/invalid, 403 si rôle insuffisant, 404 si ressource absente, 400 si champs obligatoires manquants.
- `CORS_ORIGINS` doit inclure l'URL du front pour autoriser les appels navigateur.
