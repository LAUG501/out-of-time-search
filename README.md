# Out of Time Search

A public‑facing portal that aggregates real‑time data about missing‑person cases.  It will pull:
- News articles, YouTube videos, social‑media posts, and any other public‑domain media.
- Geolocation, map overlays, and vehicle‑tracking information.
- Official data from law‑enforcement APIs (FBI NCMEC, state police, etc.).
- Reward information and tip submission forms.

The goal is to give families, investigators, and volunteers a single, searchable UI that updates **to‑the‑minute** and provides AI‑driven assistance for:
- Summarizing case details.
- Suggesting relevant media clips.
- Generating investigative leads (e.g., “search for ring‑camera footage near [location] on [date]”).

**Scope for the first MVP**
1. Front‑page with a “Top Stories” carousel filtered by state and age.
2. Search endpoint that returns a list of cases with live news/video thumbnails.
3. Map view (4‑D timeline) that can overlay Geo‑Net tracking data.
4. Simple AI chat that can query public APIs and summarize results.

**Tech‑stack ideas (open‑source & low‑cost)**
- **Backend** – Node.js (Bun) + Fastify or Express.
- **Database** – PostgreSQL + PostGIS for spatial queries (or Supabase for managed).
- **Search** – ElasticSearch / Meilisearch for fast full‑text & media‑metadata search.
- **AI** – GPT‑OSS 120B for chat, OpenAI embeddings for semantic search, Open‑source models (LLaMA, Mistral) for downstream tasks.
- **Scraping / data ingestion** – youtube‑dl / yt‑search‑python, NewsAPI, Google Custom Search, open‑source web‑crawlers (scrapy).
- **Mapping** – Mapbox GL JS, Deck.gl for 4‑D visualizations.
- **Auth** – OAuth 2 (Google, Facebook) for tip‑submitters, with optional anonymous posting.
- **Deployment** – Docker + GitHub Actions, hosted on a VPS or cloud (AWS Free‑tier, Railway, Fly.io).

**Live intel feeds now integrated**
- `GET /api/intel?query=...` aggregates YouTube + RSS sources and returns minute-grouped timeline data.
- Mission Control and Case pages now auto-refresh feed data every 60 seconds.
- Feed cards include source type, publication time, image thumbnail, and direct source links.
- Visual clustering groups repeated images by normalized thumbnail fingerprint (`visualClusterId`) to help detect repeated clues.

**Current sources wired**
- YouTube search feed
- Google News RSS search
- NYTimes US RSS
- FOX 10 Phoenix RSS
- AZ Family RSS search
- NCMEC RSS

**Run locally**
- `bun install`
- `bun run build`
- `bun run start` (serves on port `5050`)
- Open `http://localhost:5050/mission-control`

**Next steps**
- Add authenticated source connectors for X/Facebook once API keys are available.
- Add true image-to-image matching (pHash/embedding) for cross-video visual similarity.
- Add agency moderation queue for fake tip suppression and confidence escalation.
- Add persistent storage (PostgreSQL + PostGIS) for timeline/event history.