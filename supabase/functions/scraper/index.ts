// Deno runtime types are expected; removed triple-slash reference to avoid compile-time errors
// Supabase Edge Function: scraper
//
// Purpose: Fetch Nutrislice menus for UBC halls, normalize stations/dishes,
// and upsert into the schema defined in docs/SCHEMA.sql:
//   dining_halls (id, name, slug)
//   stations (id, hall_id, name, slug)
//   dishes (id, station_id, name, description)
//
// Notes:
// - Uses service role key to write; does not touch ratings/comments.
// - Aggregates all three meals (breakfast/lunch/dinner) for the requested date.
// - Idempotent per day: existing rows are re-used by slug/name matches.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Type definitions
type Meal = 'breakfast' | 'lunch' | 'dinner';
type HallSlug = 'feast' | 'gather' | 'open-kitchen';
type NutrisliceMenuInfo = Record<string, {
  section_options?: {
    display_name?: string;
  };
}>;
type NutrisliceMenuItem = {
  id?: number;
  menu_id?: string | number | null;
  food?: {
    name?: string;
    description?: string;
  };
};
type NutrisliceDay = {
  date?: string;
  menu_info?: NutrisliceMenuInfo;
  menu_items?: NutrisliceMenuItem[];
};
type NutrisliceResponse = {
  days?: NutrisliceDay[];
};
type ScrapedDish = {
  name: string;
  description: string | null;
};
type ScrapedStation = {
  slug: string;
  name: string;
  dishes: ScrapedDish[];
};
type ScrapedHall = {
  slug: HallSlug;
  name: string;
  stations: ScrapedStation[];
};
type ScrapedMenuEntry = {
  hallSlug: HallSlug;
  stationSlug: string;
  meal: Meal;
  dishName: string;
};
type ScrapeResult = {
  hall: ScrapedHall;
  menuEntries: ScrapedMenuEntry[];
};

// Load environment variables
const SUPABASE_URL = Deno.env.get('URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? '';
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}
// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false
  }
});
// Nutrislice base and verified endpoints
const NS_BASE = 'https://ubc.api.nutrislice.com/menu/api/weeks/school';
const ENDPOINTS: Record<HallSlug, Record<Meal, {
  school: string;
  menuType: string;
}>> = {
  feast: {
    breakfast: {
      school: 'ubc-feast-totem-park-residence',
      menuType: 'feast-at-totem-park'
    },
    lunch: {
      school: 'ubc-feast-totem-park-residence',
      menuType: 'feast-totem-park-residence-lunch'
    },
    dinner: {
      school: 'ubc-feast-totem-park-residence',
      menuType: 'feast-totem-park-residence-lunch'
    }
  },
  gather: {
    breakfast: {
      school: 'ubc-gather-place-vanier-residence',
      menuType: 'gather-place-vanier-residence-breakfast'
    },
    lunch: {
      school: 'ubc-gather-place-vanier-residence',
      menuType: 'gather-place-vanier-residence-lunch'
    },
    dinner: {
      school: 'ubc-gather-place-vanier-residence',
      menuType: 'gather-place-vanier-residence-lunch'
    }
  },
  'open-kitchen': {
    breakfast: {
      school: 'ubc-open-kitchen',
      menuType: 'open-kitchen-orchard-commons-residence-breakfast'
    },
    lunch: {
      school: 'ubc-open-kitchen',
      menuType: 'open-kitchen-at-orchard-commons'
    },
    dinner: {
      school: 'ubc-open-kitchen',
      menuType: 'open-kitchen-at-orchard-commons'
    }
  }
};

// Human-readable hall names
const HALL_NAMES: Record<HallSlug, string> = {
  feast: 'Feast',
  gather: 'Gather',
  'open-kitchen': 'Open Kitchen'
};
const MEALS: Meal[] = [
  'breakfast',
  'lunch',
  'dinner'
];

// date helpers
const toISODate = (d: Date = new Date())=>d.toISOString().slice(0, 10); // YYYY-MM-DD
const toPathDate = (iso: string)=>{
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
};
// converts string to slug format
const slugify = (value: string)=>value.toLowerCase().trim().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
/**
 * Filters the Nutrislice response to only include data for the specified date.
 * @param json - The original Nutrislice response
 * @param isoDate - The date in ISO format (YYYY-MM-DD)
 * @returns The filtered Nutrislice response
 */
function filterDaysForDate(json: NutrisliceResponse, isoDate: string): NutrisliceResponse {
  if (!json || !Array.isArray(json.days)) return json;
  return {
    ...json,
    days: json.days.filter((d)=>d?.date === isoDate)
  };
}
/**
 * Builds the Nutrislice menu URL for a given hall, meal, and date.
 * @param hall - The hall slug
 * @param meal - The meal type
 * @param isoDate - The date in ISO format (YYYY-MM-DD)
 * @returns The constructed URL
 */ function buildUrl(hall: HallSlug, meal: Meal, isoDate: string): string {
  const { school, menuType } = ENDPOINTS[hall][meal];
  return `${NS_BASE}/${school}/menu-type/${menuType}/${toPathDate(isoDate)}/?format=json`;
}
/**
 * Fetches JSON data from a given URL with appropriate headers.
 * @param url - The URL to fetch data from
 * @returns The parsed JSON data
 * @throws Error if the fetch fails
 */ async function fetchJson(url: string): Promise<NutrisliceResponse> {
  const res = await fetch(url, {
    headers: {
      accept: 'application/json'
    }
  });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.json();
}
/**
 * Recursively collects stations and their dishes from a nested JSON structure.
 * @param json - The input JSON data
 * @returns An array of stations with their dishes
 */ function collectStationsFromJson(json: NutrisliceResponse) {
  const stationsMap: Record<string, {
    id: number | null;
    name: string;
    description?: string;
  }[]> = {};
  if (!json || !Array.isArray(json.days)) return [];
  // 1. Build map menu_id -> station display name (e.g. "93728" -> "Grillhouse")
  const stationNameByMenuId: Record<string, string> = {};
  for (const day of json.days){
    if (!day || typeof day !== 'object') continue;
    const menuInfo = day.menu_info;
    if (!menuInfo || typeof menuInfo !== 'object') continue;
    for (const [menuId, info] of Object.entries(menuInfo)){
      const displayName = info?.section_options?.display_name;
      if (typeof displayName === 'string' && displayName.trim()) {
        stationNameByMenuId[menuId] = displayName.trim();
      }
    }
  }
  const extractDescription = (food: NutrisliceMenuItem['food'])=>food && typeof food.description === 'string' && food.description.trim() ? food.description.trim() : undefined;
  // 2. Walk menu_items and group dishes by station
  for (const day of json.days){
    const menuItems = day.menu_items;
    if (!Array.isArray(menuItems)) continue;
    for (const item of menuItems){
      if (!item || typeof item !== 'object') continue;
      const food = item.food;
      if (!food || !food.name) continue;
      const menuIdRaw = item.menu_id;
      const menuId = menuIdRaw != null ? String(menuIdRaw) : '';
      const stationName = menuId && stationNameByMenuId[menuId] || 'General';
      const id = typeof item.id === 'number' ? item.id : null;
      const name = String(food.name).trim();
      const description = extractDescription(food);
      if (!name) continue;
      if (!stationsMap[stationName]) stationsMap[stationName] = [];
      stationsMap[stationName].push({
        id,
        name,
        description
      });
    }
  }
  // 3. Convert map -> Station[]
  return Object.entries(stationsMap).map(([station, dishes])=>({
      station,
      dishes
    }));
}
/**
 * Scrapes menu data for a specific dining hall and date.
 * @param hall - The hall slug
 * @param isoDate - The date in ISO format (YYYY-MM-DD)
 * @returns The scraped hall data
 */ async function scrapeHallForDate(hall: HallSlug, isoDate: string): Promise<ScrapeResult> {
  const mealFetches = MEALS.map(async (meal): Promise<{ meal: Meal; json: NutrisliceResponse } | null>=>{
    const url = buildUrl(hall, meal, isoDate);
    console.log('fetching', hall, meal, url);
    try {
      const json = await fetchJson(url);
      return {
        meal,
        json
      };
    } catch (err) {
      console.error(`Failed fetch for ${hall} ${meal} ${isoDate}`, err);
      return null;
    }
  });
  const results = await Promise.all(mealFetches);
  const stationsBySlug = new Map<string, ScrapedStation>();
  const menuEntries: ScrapedMenuEntry[] = [];
  const menuEntryKeys = new Set<string>();
  for (const result of results){
    if (!result) continue;
    const json = filterDaysForDate(result.json, isoDate);
    // Collect stations from JSON
    const stations = collectStationsFromJson(json);
    for (const st of stations){
      // Create slug and display name for the station
      const slug = slugify(st.station || 'general');
      const name = st.station || 'General';
      // get or create the ScrapedStation
      let station = stationsBySlug.get(slug);
      if (!station) {
        station = {
          slug,
          name,
          dishes: []
        };
        stationsBySlug.set(slug, station);
      }
      // add dishes, dedupe by name (case-insensitive)
      for (const d of st.dishes){
        const already = station.dishes.find((x)=>x.name.toLowerCase() === d.name.toLowerCase());
        if (!already) {
          station.dishes.push({
            name: d.name,
            description: d.description ?? null
          });
        }
        const entryKey = `${result.meal}::${slug}::${d.name.toLowerCase()}`;
        if (!menuEntryKeys.has(entryKey)) {
          menuEntryKeys.add(entryKey);
          menuEntries.push({
            hallSlug: hall,
            stationSlug: slug,
            meal: result.meal,
            dishName: d.name
          });
        }
      }
    }
  }
  return {
    hall: {
      slug: hall,
      name: HALL_NAMES[hall],
      stations: Array.from(stationsBySlug.values())
    },
    menuEntries
  };
}
/**
 * Upserts scraped data into the database.
 * @param halls - The array of scraped halls
 * @returns Summary counts of inserted/updated records
 */
async function upsertScrapedData(results: ScrapeResult[], isoDate: string) {
  const halls = results.map((r)=>r.hall);
  // 1) Halls (unique on slug)
  const hallPayload: { slug: HallSlug; name: string }[] = halls.map((hall)=>({
      slug: hall.slug,
      name: hall.name
    }));
  const { data: hallRows, error: hallError } = await supabase.from('dining_halls').upsert(hallPayload, {
    onConflict: 'slug'
  }).select('id, slug');
  if (hallError) throw hallError;
  const hallIdBySlug = new Map<HallSlug, number>((hallRows ?? []).map((row: { slug: HallSlug; id: number })=>[
    row.slug,
    row.id
  ]));
  // 2) Stations (unique on hall_id,slug)
  const stationPayload: {
    hall_id: number;
    slug: string;
    name: string;
  }[] = [];
  const stationKeys = new Set<string>();
  for (const hall of halls){
    const hallId = hallIdBySlug.get(hall.slug);
    if (!hallId) continue;
    for (const station of hall.stations){
      const key = `${hallId}::${station.slug}`;
      if (stationKeys.has(key)) continue;
      stationKeys.add(key);
      stationPayload.push({
        hall_id: hallId,
        slug: station.slug,
        name: station.name
      });
    }
  }
  const { data: stationRows, error: stationError } = await supabase.from('stations').upsert(stationPayload, {
    onConflict: 'hall_id,slug'
  }).select('id, slug, hall_id');
  if (stationError) throw stationError;
  const stationIdByKey = new Map<string, number>((stationRows ?? []).map((row: { hall_id: number; slug: string; id: number })=>[
    `${row.hall_id}::${row.slug}`,
    row.id
  ]));
  // 3) Dishes (requires a unique constraint on station_id,name)
  const dishPayload: {
    station_id: number;
    name: string;
    description: string | null;
  }[] = [];
  const dishKeys = new Set<string>();
  for (const hall of halls){
    const hallId = hallIdBySlug.get(hall.slug);
    if (!hallId) continue;
    for (const station of hall.stations){
      const stationKey = `${hallId}::${station.slug}`;
      const stationId = stationIdByKey.get(stationKey);
      if (!stationId) continue;
      for (const dish of station.dishes){
        const key = `${stationId}::${dish.name.toLowerCase()}`;
        if (dishKeys.has(key)) continue;
        dishKeys.add(key);
        dishPayload.push({
          station_id: stationId,
          name: dish.name,
          description: dish.description ?? null
        });
      }
    }
  }
  if (dishPayload.length){
    const { error: dishError } = await supabase.from('dishes').upsert(dishPayload, {
      onConflict: 'station_id,name'
    });
    if (dishError) throw dishError;
  }
  // Build dish id lookup (covers both newly upserted and existing dishes)
  const stationIds = Array.from(new Set(Array.from(stationIdByKey.values())));
  let dishIdByKey = new Map<string, number>();
  if (stationIds.length){
    const { data: allDishes, error: dishesSelectError } = await supabase.from('dishes').select('id, station_id, name').in('station_id', stationIds);
    if (dishesSelectError) throw dishesSelectError;
    dishIdByKey = new Map<string, number>((allDishes ?? []).map((row)=>[
      `${row.station_id}::${row.name.toLowerCase()}`,
      row.id as number
    ]));
  }
  // 4) Menu entries for this date/meal
  const menuEntryPayload: {
    date: string;
    meal: Meal;
    hall_id: number;
    station_id: number;
    dish_id: number;
  }[] = [];
  const menuEntryKeys = new Set<string>();
  for (const res of results){
    const hallId = hallIdBySlug.get(res.hall.slug);
    if (!hallId) continue;
    for (const entry of res.menuEntries){
      const stationId = stationIdByKey.get(`${hallId}::${entry.stationSlug}`);
      if (!stationId) continue;
      const dishId = dishIdByKey.get(`${stationId}::${entry.dishName.toLowerCase()}`);
      if (!dishId) continue;
      const key = `${isoDate}::${entry.meal}::${stationId}::${dishId}`;
      if (menuEntryKeys.has(key)) continue;
      menuEntryKeys.add(key);
      menuEntryPayload.push({
        date: isoDate,
        meal: entry.meal,
        hall_id: hallId,
        station_id: stationId,
        dish_id: dishId
      });
    }
  }
  if (menuEntryPayload.length){
    const { error: menuError } = await supabase.from('menu_entries').upsert(menuEntryPayload, {
      onConflict: 'date,meal,station_id,dish_id'
    });
    if (menuError) throw menuError;
  }
  return {
    hallsCount: hallPayload.length,
    stationsCount: stationPayload.length,
    dishesCount: dishPayload.length,
    menuEntriesCount: menuEntryPayload.length
  };
}
/**
 * Main entry point for the Supabase Edge Function.
 * Accepts an optional 'date' query parameter (YYYY-MM-DD).
 * Scrapes menus for all halls and upserts data into the database.
 */ Deno.serve(async (req: Request)=>{
  const url = new URL(req.url);
  const dateParam = url.searchParams.get('date');
  const date = dateParam || toISODate();
  try {
    const hallSlugs = Object.keys(HALL_NAMES) as HallSlug[];
    const scrapeResults = await Promise.all(hallSlugs.map((hallSlug)=>scrapeHallForDate(hallSlug, date)));
    const summary = await upsertScrapedData(scrapeResults, date);
    return new Response(JSON.stringify({
      ok: true,
      date,
      summary
    }, null, 2), {
      status: 200,
      headers: {
        'content-type': 'application/json'
      }
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({
      ok: false,
      error: message
    }, null, 2), {
      status: 500,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
});
