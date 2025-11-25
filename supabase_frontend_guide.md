# Frontend ↔ Supabase Guide (Beginner‑Friendly)

This guide is for reconnecting the React frontend to the real Supabase data instead of the placeholder data in `src/data/mockMenu.js`.

You don’t need to know a lot of backend stuff. Follow the steps in order and test as you go

We’ll focus on **three pages**:
- Home page – list all dining halls.
- Halls page – same list, but as links.
- Dining hall page – show stations + dishes for one hall.

The pieces you already have:
- `src/lib/supabase.js` – creates the Supabase client.
- `src/api.js` – helper functions to call the database.
- Edge function `scraper` – fills the database every day (`dining_halls`, `stations`, `dishes`, `menu_entries`).

---

## 1. Make sure Supabase is set up in the frontend

Check `src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

If this file looks like that, you are good.  
If not, match it to this.

Also make sure your `.env` for the frontend (e.g. `.env.local`) has:

```bash
VITE_SUPABASE_URL=https://oeecwsfbntebctrbgofq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lZWN3c2ZibnRlYmN0cmJnb2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwMjQyNzEsImV4cCI6MjA3OTYwMDI3MX0.u4rqAyQPLmPwf5b4Kn8r_NnIR9-H3zOc8AaFmUDRfzM
```

You do **not** need to touch service role keys here - those are already in the edge function.

---

## 2. Understand the helpers in `src/api.js`

Open `src/api.js`. You’ll see functions like:

- `listHalls()` – gets all rows from `dining_halls`.
- `listStations(hallSlug)` – gets stations for a hall.
- `listDishes(stationId)` – gets dishes for a station.

These functions already talk to Supabase. You just need to **use them in the pages instead of the mock data**.

---

## 3. Home page – replace mock halls with real halls

File: `src/pages/HomePage.jsx`

Right now it does:

```js
import { hallList } from '../data/mockMenu';
// ...
{hallList.map((hall) => (
  <DiningHallCard
    key={hall.id}
    hallId={hall.id}
    name={hall.name}
    logo={hall.logo}
  />
))}
```

Goal: load halls from Supabase using `listHalls()`.

Steps:

1. At the top, import React hooks and the API:

   ```js
   import { useEffect, useState } from 'react';
   import { listHalls } from '../api';
   ```

2. Inside `HomePage`, add state to hold halls:

   ```js
   const [halls, setHalls] = useState([]);
   const [loading, setLoading] = useState(true);
   ```

3. Use `useEffect` to load data once when the page loads:

   ```js
   useEffect(() => {
     (async () => {
       try {
         const data = await listHalls();
         setHalls(data);
       } catch (err) {
         console.error('Failed to load halls', err);
       } finally {
         setLoading(false);
       }
     })();
   }, []);
   ```

4. Replace the `hallList.map` section with:

   ```jsx
   {loading && <Text>Loading halls…</Text>}
   {!loading && halls.map((hall) => (
     <DiningHallCard
       key={hall.id}
       hallId={hall.slug}      // we’ll route by slug
       name={hall.name}
       logo={null}             // optional: later map logos by slug
     />
   ))}
   ```

5. Make sure links that point to a hall use the **slug**, not the mock `id`.  
   Example link (in `DiningHallCard` or `Halls.jsx`): `/hall/feast`, `/hall/gather`, etc.

---

## 4. Halls page – list halls from Supabase

File: `src/pages/Halls.jsx`

Currently it imports `hallList` from the mock file. Do almost the same change as HomePage:

1. Import hooks and `listHalls`:

   ```js
   import { useEffect, useState } from 'react';
   import { listHalls } from '../api';
   ```

2. Add state + effect:

   ```js
   const [halls, setHalls] = useState([]);

   useEffect(() => {
     (async () => {
       const data = await listHalls();
       setHalls(data);
     })();
   }, []);
   ```

3. Replace `hallList.map` with `halls.map`, and use `hall.slug` in the link:

   ```jsx
   {halls.map((hall) => (
     <ListItem key={hall.id}>
       <Link to={`/hall/${hall.slug}`}>{hall.name}</Link>
     </ListItem>
   ))}
   ```

At this point, the home page and halls list should be fully driven by Supabase.

---

## 5. Dining hall page – stations + dishes from Supabase

File: `src/pages/DiningHallPage.jsx`

Right now it uses:

```js
import { getHall } from '../data/mockMenu';
// ...
const { hallId = '' } = useParams();
const hall = getHall(hallId);
const hallStations = hall?.stations ?? [];
```

We want to:
- Use the URL parameter (`hallId`) as the **hall slug**.
- Load stations and dishes from the database.

Steps:

1. Replace the mock import with API + React hooks:

   ```js
   import { useEffect, useState } from 'react';
   import { listStations, listDishes, listHalls } from '../api';
   ```

2. Keep `useParams`:

   ```js
   const { hallId = '' } = useParams(); // this is the slug, e.g. "feast"
   ```

3. Add state:

   ```js
   const [hallName, setHallName] = useState('');
   const [stations, setStations] = useState([]);
   const [loading, setLoading] = useState(true);
   ```

4. useEffect to load hall info + stations + dishes:

   ```js
   useEffect(() => {
     (async () => {
       try {
         setLoading(true);

         // 1) Get hall name from listHalls
         const allHalls = await listHalls();
         const hall = allHalls.find((h) => h.slug === hallId);
         setHallName(hall ? hall.name : hallId);

         // 2) Get stations for this hall
         const stationRows = await listStations(hallId);

         // 3) For each station, get dishes
         const stationsWithDishes = [];
         for (const st of stationRows) {
           const dishes = await listDishes(st.id);
           stationsWithDishes.push({ ...st, dishes });
         }

         setStations(stationsWithDishes);
       } catch (err) {
         console.error('Failed to load hall page', err);
       } finally {
         setLoading(false);
       }
     })();
   }, [hallId]);
   ```

5. In the JSX, replace `hall` / `hallStations` with the new state:

   - Title:

   ```jsx
   <Heading size="lg" color="black">
     {hallName || 'Dining Hall'}
   </Heading>
   ```

   - Accordion:

   ```jsx
   <Accordion allowMultiple>
     {stations.map((station) => (
       <StationAccordionItem
         key={station.id}
         station={station}
         hallId={hallId}
       />
     ))}
   </Accordion>
   {stations.length === 0 && !loading && (
     <Box p={6} borderWidth="1px" borderRadius="md" textAlign="center" color="gray.500">
       Menu information not yet available for this date.
     </Box>
   )}
   ```

   `StationAccordionItem` already expects a `station` object with a `dishes` array, so this should continue to work.

---

## 6. Later: use `menu_entries` to show **today’s** dishes only

For now, `listDishes(stationId)` will return **all dishes ever** at that station.

Once the basics work, you can:
- Add a new helper in `src/api.js` like `listDishesForDate(stationId, date, meal)` that joins `menu_entries` with `dishes`.
- Replace `listDishes` with that helper and pass in today’s date + selected meal.

This is an advanced step; don’t worry about it until everything else is working.

---

## 7. How to tell if it’s working

After each change:

1. Run the frontend (e.g. `npm run dev`).
2. Open the browser and:
   - Home page: see real hall names from the DB (if you change them in Supabase, they should change here).
   - Halls page: links should still work and go to `/hall/feast`, `/hall/gather`, etc.
   - Hall page: stations + dishes should match what the scraper has inserted.

If something breaks, check the browser console for errors; they will usually say which function or select failed (`listHalls`, `listStations`, etc.).

You don’t need to change the backend to do any of this – just use the existing helpers in `src/api.js` and swap out the mock data.  

