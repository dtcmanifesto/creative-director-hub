# Creative Director Hub

A real-time creative intelligence dashboard for DTC brand creative directors. Think Bloomberg terminal meets creative agency war room.

![Dark Theme](https://img.shields.io/badge/theme-dark-000000)
![Vanilla JS](https://img.shields.io/badge/stack-vanilla%20JS-F7DF1E)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E)

## Overview

This dashboard serves as the intelligence command center for a DTC brand's creative director. It's designed for making 20+ decisions a day with dense, scannable information.

**Built for:** Freak Athlete (DTC fitness equipment)  
**Stack:** Vanilla HTML, CSS, JavaScript (no frameworks)  
**Backend:** Supabase (PostgreSQL + Realtime)

## Features

### 11 Intelligence Tabs

1. **☀️ Daily Briefing** - Auto-summary of what matters today
2. **📊 Performance** - Winners Wall and creative leaderboard
3. **⚡ Fatigue Tracker** - Ad performance trends with sparklines
4. **🧪 Test Log** - A/B tests, learnings, pattern recognition
5. **🎬 Creative Mix** - Environment, talent, style gap analysis
6. **🔍 Competitor Intel** - Competitor profiles and swipe file
7. **🔥 Trending Now** - Viral content tracking with adaptation notes
8. **🧠 Audience Intel** - Avatar profiles and objection mapping
9. **💬 Comment Mining** - Ad comment analysis and golden nuggets
10. **🎯 Offer Matrix** - Active offers and performance data
11. **📱 Platform Playbook** - Platform-specific best practices

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/dtcmanifesto/creative-director-hub.git
cd creative-director-hub
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Once created, go to **Settings > API**
3. Copy your **Project URL** and **anon public** key

### 3. Configure the app

Edit `js/config.js`:

```javascript
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 4. Create the database tables

1. In Supabase, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste and run it

### 5. Deploy

**Option A: GitHub Pages**
1. Push to GitHub
2. Go to repo Settings > Pages
3. Deploy from main branch

**Option B: Vercel**
1. Connect your GitHub repo to Vercel
2. Deploy with default settings

## Project Structure

```
creative-director-hub/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles (dark theme)
├── js/
│   ├── app.js              # Main app, routing
│   ├── config.js           # Supabase credentials
│   ├── supabase.js         # Database client
│   ├── tabs/               # Tab modules
│   │   ├── daily-briefing.js
│   │   ├── performance.js
│   │   ├── fatigue-tracker.js
│   │   ├── test-log.js
│   │   ├── creative-mix.js
│   │   ├── competitor-intel.js
│   │   ├── trending.js
│   │   ├── audience-intel.js
│   │   ├── comment-mining.js
│   │   ├── offer-matrix.js
│   │   └── platform-playbook.js
│   └── utils/
│       ├── charts.js       # Chart.js helpers
│       └── helpers.js      # Utility functions
├── supabase/
│   └── schema.sql          # Database schema
└── README.md
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `creatives` | All ads with performance data |
| `creative_metrics` | Daily time-series metrics |
| `creative_tags` | Environment, talent, style tags |
| `tests` | A/B tests and experiments |
| `learnings` | Codified rules from tests |
| `competitors` | Competitor profiles |
| `competitor_ads` | Individual competitor ads |
| `trends` | Trending sounds, formats, hooks |
| `avatars` | Customer avatar profiles |
| `objections` | Customer objections + counters |
| `comments` | Ad comment mining data |
| `offers` | Offer/promotion library |
| `platform_notes` | Platform playbook content |

## Meta Ads API Integration

The schema supports automated data ingestion via Meta Ads API:

- `meta_ad_id` on `creatives` is the sync key
- `creative_metrics` stores daily performance data
- Ad naming convention parsing can auto-populate `creative_tags`

Example ad name format:
```
FA_UGC_QuestionHook_Gym_Male2535_TalkingHead
```

## Design

- **Theme:** Dark mode (#0A0A0A background)
- **Accent:** Freak Athlete orange (#F0582B)
- **Typography:** Outfit (UI), JetBrains Mono (data)
- **Charts:** Chart.js for all visualizations

## License

MIT
