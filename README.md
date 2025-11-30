## Rate My Dish @ UBC

React + Supabase web app for rating and commenting on UBC dining hall dishes. Live: https://rate-my-dish-ubc.vercel.app

### Requirements
- Node.js 18+ and npm
- Supabase project with tables in `docs/SCHEMA.sql`
- Environment variables: see `.env.example`

### Installation & Running
1) Install dependencies: `npm install`
2) Create `.env` in project root:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_GOOGLE_CLIENT_ID=<your-oauth-client-id>
```
3) Start dev server: `npm run dev` (default: http://localhost:5173)
4) Build for production: `npm run build`
5) Preview built app locally: `npm run preview`

Supabase notes:
- Use the SQL in `docs/SCHEMA.sql` to create tables/constraints.
- Enable RLS on `ratings` and `comments`; allow read for authenticated users and write only when `auth.uid() = user_id`.
- The Edge Function scraper lives in `supabase/functions/scraper`; deploy separately if you want automated menu ingestion.

### Testing & Coverage
- Run tests: `npm test`
- Watch mode: `npm run test:watch`
- Coverage report: `npm run test:coverage` (outputs to `coverage/`)
Tests mock Supabase so they run offline; they verify our client-side calls, auth guards, and data mapping. They do not cover Supabase RLS/SQL behavior.

### Known Bugs / Limitations
- Comments and ratings are not paginated; large threads may load slowly.
- Error handling is minimal for Supabase outages (retry/backoff not implemented).
- Menu data from the Supabase Edge Function scraper is loaded via a daily cron, not on-demand from the UI.

### Contributions Statement
- Ryan: PM, database schema and Nutrislice API ingest
- Daniel: Auth flow integration
- Ivan: Ratings submission and dish flow
- Thomas: Leaderboard logic and UI
- Muk: Frontend scaffolding, routing, navbar/layout

### Project Context
Problem: UBC students cannot tell which dining hall dishes are good from Nutrislice alone, leading to wasted trips and bad meals. This app crowdsources ratings/comments so students can choose better. 
