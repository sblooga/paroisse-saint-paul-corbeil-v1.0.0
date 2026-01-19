# Déploiement Render (backend & frontend)

## Backend (Web Service Node)
- Build Command : `cd server && npm install --legacy-peer-deps && npx prisma generate`
- Start Command : `cd server && node index.js`
- Node : `NODE_VERSION=20` (via variable d'environnement)
- Variables à définir :
  - `DATABASE_URL` (Neon)
  - `JWT_SECRET`
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_ROLE=ADMIN`, `ADMIN_FORCE_RESET=false`
  - `CORS_ORIGINS` (URLs front, séparées par des virgules)
  - Cloudinary si utilisé : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `CLOUDINARY_FOLDER`
- Auto-deploy : activer sur la branche `main` dans Settings > Build & Deploy (sinon déployer manuellement).

## Frontend (Static Site Vite)
- Build Command : `npm install && npm run build`
- Publish Directory : `dist`
- Root Directory : vide (ne pas mettre `server`)
- Variables à définir :
  - `VITE_API_URL=https://paroisse-saint-paul-backend.onrender.com/api`
- Auto-deploy : activer sur la branche `main`.

## Check & dépannage
- Front 404/“Cannot GET /” : vérifier le service static et que `dist` est présent (build command correcte).
- API inaccessible : vérifier `DATABASE_URL` et redeployer le backend.
- CORS : ajouter le domaine front dans `CORS_ORIGINS`.
- Auth/admin qui échoue : mettre `ADMIN_FORCE_RESET=true` temporairement, redeployer, se connecter, puis remettre `false`.
