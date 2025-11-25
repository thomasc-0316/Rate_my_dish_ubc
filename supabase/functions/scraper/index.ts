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
const ENDPOINTS = {
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
const HALL_NAMES = {
  feast: 'Feast',
  gather: 'Gather',
  'open-kitchen': 'Open Kitchen'
};
const MEALS = [
  'breakfast',
  'lunch',
  'dinner'
];
// date helpers
const toISODate = (d = new Date())=>d.toISOString().slice(0, 10); // YYYY-MM-DD
const toPathDate = (iso)=>{
  const [y, m, d] = iso.split('-');
  return `${y}/${m}/${d}`;
};
// converts string to slug format
const slugify = (value)=>value.toLowerCase().trim().replace(/['"]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
/**
 * Builds the Nutrislice menu URL for a given hall, meal, and date.
 * @param hall - The hall slug
 * @param meal - The meal type
 * @param isoDate - The date in ISO format (YYYY-MM-DD)
 * @returns The constructed URL
 */ function buildUrl(hall, meal, isoDate) {
  const { school, menuType } = ENDPOINTS[hall][meal];
  return `${NS_BASE}/${school}/menu-type/${menuType}/${toPathDate(isoDate)}/?format=json`;
}
/**
 * Fetches JSON data from a given URL with appropriate headers.
 * @param url - The URL to fetch data from
 * @returns The parsed JSON data
 * @throws Error if the fetch fails
 */ async function fetchJson(url) {
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
 */ function collectStationsFromJson(json) {
  const stationsByName = {};
  const stationsMap = {};
  if (!json || !Array.isArray(json.days)) return [];
  // 1. Build map menu_id -> station display name (e.g. "93728" -> "Grillhouse")
  const stationNameByMenuId = {};
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
  const extractDescription = (food)=>food && typeof food.description === 'string' && food.description.trim() ? food.description.trim() : undefined;
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
 */ async function scrapeHallForDate(hall, isoDate) {
  const stationsBySlug = new Map();
  for (const meal of MEALS){
    //Build URL for hall and mealtime
    const url = buildUrl(hall, meal, isoDate);
    let json;
    console.log('fetching', hall, meal, url);
    // Fetch JSON
    try {
      json = await fetchJson(url);
    } catch (err) {
      console.error(`Failed fetch for ${hall} ${meal} ${isoDate}`, err);
      continue;
    }
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
      }
    }
  }
  return {
    slug: hall,
    name: HALL_NAMES[hall],
    stations: Array.from(stationsBySlug.values())
  };
}
/**
 * Gets or creates a dining hall by slug.
 * @param slug - The hall slug
 * @param name - The hall name
 * @returns The hall ID
 */ async function getOrCreateHallId(slug, name) {
  // Check if hall exists
  const { data, error } = await supabase.from('dining_halls').select('id').eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (data?.id) return data.id;
  // Insert new hall
  const { data: inserted, error: insertError } = await supabase.from('dining_halls').insert({
    slug,
    name
  }).select('id').single();
  if (insertError) throw insertError;
  return inserted.id;
}
/**
 * Gets or creates a station by hall ID and slug.
 * @param hallId - The dining hall ID
 * @param slug - The station slug
 * @param name - The station name
 * @returns The station ID
 */ async function getOrCreateStationId(hallId, slug, name) {
  // Check if station exists
  const { data, error } = await supabase.from('stations').select('id').eq('hall_id', hallId).eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (data?.id) return data.id;
  // Insert new station
  const { data: inserted, error: insertError } = await supabase.from('stations').insert({
    hall_id: hallId,
    slug,
    name
  }).select('id').single();
  if (insertError) throw insertError;
  return inserted.id;
}
/**
 * Upserts a dish by station ID and name.
 * @param stationId 
 * @param name 
 * @param description 
 * @returns the dish ID
 */ async function upsertDish(stationId, name, description) {
  // Check if dish exists
  const { data, error } = await supabase.from('dishes').select('id').eq('station_id', stationId).eq('name', name).maybeSingle();
  if (error) throw error;
  if (data?.id) {
    // Update description if we have a new one
    if (description) {
      await supabase.from('dishes').update({
        description
      }).eq('id', data.id);
    }
    return data.id;
  }
  // Insert new dish
  const { data: inserted, error: insertError } = await supabase.from('dishes').insert({
    station_id: stationId,
    name,
    description: description ?? null
  }).select('id').single();
  if (insertError) throw insertError;
  return inserted.id;
}
/**
 * Upserts scraped data into the database.
 * @param halls - The array of scraped halls
 * @returns Summary counts of inserted/updated records
 */ async function upsertScrapedData(halls) {
  let hallsCount = 0;
  let stationsCount = 0;
  let dishesCount = 0;
  // Process each hall
  for (const hall of halls){
    const hallId = await getOrCreateHallId(hall.slug, hall.name);
    hallsCount += 1;
    for (const station of hall.stations){
      const stationId = await getOrCreateStationId(hallId, station.slug, station.name);
      stationsCount += 1;
      for (const dish of station.dishes){
        await upsertDish(stationId, dish.name, dish.description ?? null);
        dishesCount += 1;
      }
    }
  }
  return {
    hallsCount,
    stationsCount,
    dishesCount
  };
}
/**
 * Main entry point for the Supabase Edge Function.
 * Accepts an optional 'date' query parameter (YYYY-MM-DD).
 * Scrapes menus for all halls and upserts data into the database.
 */ Deno.serve(async (req)=>{
  const url = new URL(req.url);
  const dateParam = url.searchParams.get('date');
  const date = dateParam || toISODate();
  try {
    const halls = [];
    for (const hallSlug of Object.keys(HALL_NAMES)){
      const scraped = await scrapeHallForDate(hallSlug, date);
      halls.push(scraped);
    }
    const summary = await upsertScrapedData(halls);
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
    return new Response(JSON.stringify({
      ok: false,
      error: err.message
    }, null, 2), {
      status: 500,
      headers: {
        'content-type': 'application/json'
      }
    });
  }
});
