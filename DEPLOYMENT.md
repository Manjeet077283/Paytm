# 🚀 Deployment Guide: Paytm WorkMate

Complete step-by-step instructions to deploy **Paytm WorkMate** to **Render (Backend)** and **Netlify (Frontend)**.

---

## Part 1: Push Code to GitHub

Open terminal in the project directory:

```bash
git init
git add .
git commit -m "feat: Paytm WorkMate ready for Render and Netlify deployment"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

*(Note: `.gitignore` is already configured so `node_modules` and local `.env` passwords will NOT be exposed).*

---

## Part 2: Deploy Backend to Render

1. Go to [https://dashboard.render.com/](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name:** `paytm-workmate-backend`
   - **Region:** Singapore / Frankfurt / Oregon (any)
   - **Branch:** `main`
   - **Root Directory:** `server`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Add **Environment Variables** (under *Environment* tab):

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | `mongodb+srv://nikhilkumaarrr30_db_user:nikhil%40335500@sih.u3i9buo.mongodb.net/paytm_workmate?retryWrites=true&w=majority&appName=SIH` |
| `GEMINI_API_KEY` | `AQ.Ab8RN6JTfBRjWzt8xWBWhbuxOcVKtoak4KlfX4yaRH4NfuTatQ` |
| `LLM_MODEL` | `gemini-2.5-flash` |
| `LLM_PROVIDER` | `gemini` |
| `JWT_SECRET` | `paytm_workmate_super_secret_jwt_key_2025_secure` |

5. Click **Create Web Service**.
6. Once deployed, copy your Render live URL (e.g. `https://paytm-workmate-backend.onrender.com`).

---

## Part 3: Deploy Frontend to Netlify

1. Go to [https://app.netlify.com/](https://app.netlify.com/) and click **Add new site** → **Import an existing project**.
2. Connect your GitHub repository.
3. Configure the build settings:
   - **Base directory:** `client`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. In **Environment variables**, click **Add a variable**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://paytm-workmate-backend.onrender.com` *(paste your Render backend URL)* |

5. Click **Deploy site**.
6. Netlify will build and publish your site with automatic SPA routing (configured via `netlify.toml` and `_redirects`).

---

## Part 4: Verification Checklist

Once both are deployed:
- [ ] Open your Netlify URL: `https://your-site.netlify.app`
- [ ] Check that the status indicator says **"Connected"** (Socket.IO active).
- [ ] Click **"Quick Demo"** or **"Launch Autonomous Teammate"**.
- [ ] Verify live step completion, approval popup, and report downloads (PDF & Excel).
