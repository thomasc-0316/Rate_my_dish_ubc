# Rate My Food UBC – JavaScript MVP Architecture

## Overview
This beginner-friendly MVP keeps everything in one React + Chakra UI client. The app talks directly to Supabase (Auth + Postgres) with `@supabase/supabase-js`. No custom backend, RPC, Docker, or scraper is included in this version.

## Components

### Data (Server)
| Component | Responsibility | Location | Talks To |
|-----------|----------------|----------|----------|
| Supabase tables (`dining_halls`, `stations`, `dishes`, `ratings`, `comments`) | Store all dining data with minimal columns | Server | Queried by `src/api.js`; responses are JSON rows returned to the client |

### Client Models & API
| Component | Responsibility | Location | Talks To |
|-----------|----------------|----------|----------|
| Plain JavaScript objects | Hold row data returned from Supabase; no extra schema layer | Client | Consumed by components and pages only |
| `src/lib/supabase.js` | Initializes the Supabase browser client from environment variables | Client | Supabase REST endpoints for auth and table access |
| `src/api.js` | Wraps Supabase calls for auth, halls, stations, dishes, stats, ratings, and comments | Client | Sends simple `select`, `insert`, `update` requests to Supabase and returns JSON results |

### Views
| Component | Responsibility | Location | Talks To |
|-----------|----------------|----------|----------|
| `src/App.jsx` | Chakra layout with header, sign-in/out button, and router setup | Client | Calls `getSession`, `signInWithPassword`, `signOut`; renders routed pages |
| `src/pages/Home.jsx` | Leaderboard landing that displays dishes with average score and count | Client | Calls `listDishes` and `getDishStats` (temporary sample until grouped query is added) |
| `src/pages/Halls.jsx` | Lists every dining hall with links | Client | Calls `listHalls` |
| `src/pages/Hall.jsx` | Shows stations and dishes for a given hall slug | Client | Calls `listStations` and `listDishes` |
| `src/pages/Dish.jsx` | Dish detail view with average rating, star input, and comments | Client | Calls `getDish`, `getDishStats`, `listComments`, `addOrUpdateRating`, `addComment` |

### Shared UI
| Component | Responsibility | Location | Talks To |
|-----------|----------------|----------|----------|
| `src/components/DishCard.jsx` | Reusable dish summary card with optional stats | Client | Receives props from pages; no direct data calls |
| `src/components/RatingStars.jsx` | Basic 1–5 star selector for rating submissions | Client | Emits `onChange` callbacks to parent components |

## Data Flow
1. `src/App.jsx` boots, checks the Supabase session, and renders the current route.
2. Each page uses functions from `src/api.js` to read or write Supabase data.
3. Supabase handles authentication, table storage, and row-level security; the client displays results and posts updates.

The result is a small, easy-to-understand codebase focused on React JSX files and one JavaScript API helper module.
