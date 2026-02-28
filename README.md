# Loparo — AI Workflow Automation Studio

Portfolio & landing page for Loparo's freelance automation business.

## Quick Deploy

### 1. Install & test locally
```bash
npm install
cp .env.local.example .env.local
npm run dev
```
Visit http://localhost:3000

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Loparo website"
git remote add origin https://github.com/YOUR-USERNAME/loparo.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel
- Go to vercel.com/new
- Import your `loparo` repo
- Deploy (no env vars needed for the static site)
- Every push to main auto-deploys

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Vercel
