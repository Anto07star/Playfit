# Deploy PlayFit for free

Database: **Neon** · Backend: **Render** · Frontend: **Cloudflare Pages** (or Netlify) · Images: **Cloudinary** (optional)

## 0. Push the code to GitHub
Create an empty repo on github.com (e.g. `playfit`), then in the `playfit` folder:
```bash
git init
git add .
git commit -m "PlayFit"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/playfit.git
git push -u origin main
```
(`.env` is git-ignored, so your secrets are not uploaded.)

## 1. Database – Neon
1. Sign up at neon.com, create a project (any name, nearest region).
2. Copy the **connection string** (starts with `postgresql://...`). Keep it for step 3.

## 2. Images – Cloudinary (optional but recommended)
Free servers delete uploaded files on restart. Cloudinary keeps them.
1. Sign up at cloudinary.com → Dashboard.
2. Copy **Cloud name**, **API key**, **API secret**.
(Skip this and use "paste image URL" in the admin instead if you prefer.)

## 3. Backend – Render
1. render.com → New → **Web Service** → connect your GitHub repo.
2. Settings:
   - Root Directory: `backend`
   - Runtime: Node
   - Build Command: `npm install --include=dev && npm run build`
   - Start Command: `npm run start:prod`
   - Instance type: **Free**
3. Environment variables:

| Key | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `DATABASE_URL` | the Neon connection string |
| `JWT_SECRET` | any long random text |
| `ADMIN_EMAIL` | your admin email |
| `ADMIN_PASSWORD` | a strong password (used when the database is first created) |
| `CORS_ORIGIN` | `http://localhost:5173` for now (fix in step 5) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | from step 2 (optional) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | optional |

4. Deploy. Test: open `https://YOUR-SERVICE.onrender.com/api/categories` – you should see `[]`.

## 4. Frontend – Cloudflare Pages
1. dash.cloudflare.com → Workers & Pages → Create → Pages → connect GitHub repo.
2. Settings:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Build output directory: `dist`
3. Environment variable: `VITE_API_URL` = `https://YOUR-SERVICE.onrender.com` (no slash at the end).
4. Deploy. You get a URL like `https://playfit.pages.dev`.

(Netlify works the same: base directory `frontend`, build `npm run build`, publish `frontend/dist`.)

## 5. Connect them
Go back to Render → Environment → set `CORS_ORIGIN` to your Pages URL (e.g. `https://playfit.pages.dev`, no slash) → save. Render redeploys.

Now open your Pages URL. Admin: `/admin/login`.

## 6. Keep the backend awake (optional)
Free Render services sleep after 15 minutes idle (first visit then takes ~1 minute).
Free workaround: uptimerobot.com → new HTTP monitor → `https://YOUR-SERVICE.onrender.com/api/categories` every 10 minutes.

## Notes
- Do not use Render's free PostgreSQL: it is deleted after about 30 days. Neon's free plan does not expire.
- Neon's free database sleeps when idle; the first request after a quiet period is slightly slower.
- Vercel's free plan is for non-commercial use, so use Cloudflare Pages or Netlify for a shop.
