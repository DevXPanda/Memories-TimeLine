# 💕 Our Memories — Production Full-Stack App

A beautiful, private memory-keeping app for couples.
**Stack:** Next.js 14 · Convex · Tailwind CSS · Google Gemini AI

---

## ✨ Feature List

| Feature | Details |
|---|---|
| 🔐 PIN auth | 4-digit shared PIN, session-based, lockout after 5 failed tries |
| 📸 Photo uploads | Via Convex Storage, max 10 MB |
| 😊 Mood tags | happy, romantic, adventurous, peaceful, silly, emotional |
| 🏷️ Categories | Date Night, Travel, Anniversary, Everyday, Milestone, Other |
| #️⃣ Custom tags | Add your own hashtags to any memory |
| ⭐ Favorites | Star memories, filter by favorites |
| 🔍 Search | Full-text search by title, caption, location |
| 📅 Timeline | Chronological vertical timeline grouped by year |
| 🌸 On This Day | Memories from today in past years |
| 📊 Stats | Total memories, favorites, days together, categories |
| 🤖 AI love notes | Gemini generates poetic captions per memory |
| 💬 Dil chatbot | Romantic AI companion — Hindi/Hinglish/English |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Convex (free)
```bash
npx convex dev
```
Copy the `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL` from the output.

### 3. Get a FREE Gemini API key
→ [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

Set it in Convex (server-side — never exposed to browser):
```bash
npx convex env set GEMINI_API_KEY AIza...your-key
```

### 4. Configure environment
```bash
cp .env.example .env.local
```
Edit `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-project.convex.site
NEXT_PUBLIC_APP_PIN=0614       # ← Change to your special date!
```

### 5. Run
```bash
# Terminal 1
npx convex dev

# Terminal 2
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 💕

---

## 📁 Project Structure

```
our-memories/
├── app/
│   ├── globals.css              # Full design system
│   ├── layout.tsx               # Root layout: Convex + Auth + Chatbot
│   ├── not-found.tsx            # 404 page
│   ├── page.tsx                 # Home: hero, stats, filters, grid
│   ├── memories/
│   │   ├── new/page.tsx         # Create memory
│   │   └── [id]/
│   │       ├── page.tsx         # Memory detail
│   │       └── edit/page.tsx    # Edit memory
│   └── timeline/page.tsx        # Vertical timeline
├── components/
│   ├── AuthProvider.tsx         # PIN gate + lockout + context
│   ├── LoveChatbot.tsx          # "Dil" AI chatbot widget
│   ├── MemoryCard.tsx           # Grid card component
│   ├── MemoryForm.tsx           # Create/edit form (AI + tags + image)
│   └── Navbar.tsx               # Sticky nav with search
├── convex/
│   ├── schema.ts                # DB schema with indexes
│   ├── memories.ts              # All queries + mutations
│   └── http.ts                  # Gemini: caption + chat endpoints (CORS-ready)
└── lib/
    ├── constants.ts             # Moods, categories, color maps
    └── utils.ts                 # Date formatters, helpers
```

---

## 🔒 Security Notes

- **PIN is session-based** — cleared on browser close
- **Gemini key is server-side** — set in Convex env, never in `NEXT_PUBLIC_`
- **Lockout** — 30-second lockout after 5 wrong PIN attempts
- **Image validation** — 10 MB max, file type checked client-side

---

## 🌐 Deploy to Production

### Convex
```bash
npx convex deploy
```

### Vercel (recommended for Next.js)
```bash
npm i -g vercel
vercel --prod
```

Set these in your Vercel project settings → Environment Variables:
```
NEXT_PUBLIC_CONVEX_URL
NEXT_PUBLIC_CONVEX_SITE_URL
NEXT_PUBLIC_APP_PIN
```
(Do NOT add `GEMINI_API_KEY` to Vercel — it lives in Convex only.)

---

## 💬 Dil — AI Love Companion

Dil is a romantic chatbot powered by Gemini 1.5 Flash.

**Capabilities:**
- Hindi, Hinglish, English — auto-matches your language
- Real gf/bf energy — warm, playful, never robotic
- Shayari on request, emotional support, celebrations
- Cute nicknames: jaan, baby, yaar, sweetheart
- Personalized with your names via ⚙️ settings

**Quick replies:**
> "Aaj kaisa feel ho raha hai?" · "Koi shayari sunao" · "I miss you" · "Mujhe motivate karo"

---

Made with 💕 — for two people who want to remember everything.
