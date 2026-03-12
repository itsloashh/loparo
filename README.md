# Loparo — AI Workflow Automation

Next.js 14 + Tailwind CSS + TypeScript

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push this folder to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New → Project
3. Import your repo → Deploy
4. Add environment variable: `NEXT_PUBLIC_WEBHOOK_URL` = your n8n webhook URL

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_WEBHOOK_URL` | n8n webhook POST endpoint for contact form |

## Project Structure

```
app/
  layout.tsx      — Root layout, metadata, JSON-LD, OG tags
  page.tsx        — Homepage (all sections)
  globals.css     — Tailwind + custom styles
components/
  Navbar.tsx      — Fixed nav with mobile hamburger
  ThemeToggle.tsx — Dark/light mode toggle
  ScrollReveal.tsx — IntersectionObserver scroll animations
  PortfolioSection.tsx — Case studies grid + modal
  CaseStudyModal.tsx   — Full case study overlay
  ContactForm.tsx      — Form with webhook submission
lib/
  data.ts         — Case study data
```
