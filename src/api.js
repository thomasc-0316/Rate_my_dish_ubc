import { supabase } from './lib/supabase';

export async function getSession() {
  return supabase.auth.getSession();
}

export async function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email, password, username) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });
}

// Ensures a profile row exists for the current user with a username.
// If a preferredUsername is provided, it will be used; otherwise falls back to
// user metadata `username` or the email local-part. Handles unique conflicts by
// appending a numeric suffix.
export async function ensureProfile(preferredUsername) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return { ensured: false };

  const userId = user.id;
  // Check if profile already exists
  const { data: existing, error: existingErr } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', userId)
    .maybeSingle();
  if (existingErr) throw existingErr;
  if (existing) return { ensured: true, username: existing.username };

  const base = (preferredUsername || user.user_metadata?.username || user.email?.split('@')[0] || 'user')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'user';

  let attempt = base;
  let suffix = 0;
  while (true) {
    const { error: insertErr } = await supabase.from('profiles').insert({ id: userId, username: attempt });
    if (!insertErr) return { ensured: true, username: attempt };
    // 23505 = unique_violation
    if ((insertErr.code || insertErr.message)?.toString().includes('23505')) {
      suffix += 1;
      attempt = `${base}${suffix}`;
      continue;
    }
    // Other errors: bubble up
    throw insertErr;
  }
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function listHalls() {
  const { data, error } = await supabase.from('dining_halls').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function listStations(hallSlug) {
  const { data, error } = await supabase
    .from('stations')
    .select('id, hall_id, name, slug, dining_halls!inner(slug)')
    .eq('dining_halls.slug', hallSlug)
    .order('name');
  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    hall_id: row.hall_id,
    name: row.name,
    slug: row.slug
  }));
}

export async function listDishes(stationId) {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('station_id', stationId)
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function getDish(dishId) {
  const { data, error } = await supabase.from('dishes').select('*').eq('id', dishId).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function getProfile(userId) {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

// Normalize a username to our allowed format: lowercase, a-z 0-9 _ only,
// collapse repeats and trim edges. Returns a non-empty string or 'user'.
function normalizeUsername(input) {
  return (
    (input || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '') || 'user'
  );
}

// Allow a signed-in user to change their username.
// Returns { username } on success. Throws on other errors.
export async function updateUsername(newUsername) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) throw new Error('Not signed in');

  const base = normalizeUsername(newUsername);
  if (base.length < 3 || base.length > 32) {
    const err = new Error('Username must be 3–32 characters (letters, numbers, underscore).');
    err.code = 'INVALID_USERNAME';
    throw err;
  }

  let attempt = base;
  let suffix = 0;
  while (true) {
    // First try to update existing profile row
    const { data: updData, error: updErr } = await supabase
      .from('profiles')
      .update({ username: attempt })
      .eq('id', user.id)
      .select('id, username');

    if (!updErr && (updData?.length ?? 0) > 0) {
      return { username: attempt };
    }

    // If no row updated (profile might not exist), attempt insert
    if (!updErr && (updData?.length ?? 0) === 0) {
      const { error: insErr } = await supabase
        .from('profiles')
        .insert({ id: user.id, username: attempt });
      if (!insErr) return { username: attempt };
      // Handle unique violation on insert
      if ((insErr.code || insErr.message)?.toString().includes('23505')) {
        suffix += 1;
        attempt = `${base}${suffix}`;
        continue;
      }
      throw insErr;
    }

    // If update errored due to unique violation, try a new attempt
    if (updErr && (updErr.code || updErr.message)?.toString().includes('23505')) {
      suffix += 1;
      attempt = `${base}${suffix}`;
      continue;
    }

    if (updErr) throw updErr;
  }
}

export async function getDishStats(dishId) {
  const { data, error } = await supabase.from('ratings').select('score').eq('dish_id', dishId);
  if (error) throw error;
  const rows = data ?? [];
  const count = rows.length;
  const total = rows.reduce((sum, row) => sum + row.score, 0);
  return { avg: count ? total / count : 0, count };
}

export async function addOrUpdateRating(dishId, score) {
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) throw new Error('Not signed in');
  return supabase.from('ratings').upsert(
    [{ dish_id: dishId, user_id: userId, score }],
    { onConflict: 'dish_id,user_id' }
  );
}

export async function listComments(dishId, limit = 20) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('dish_id', dishId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const rows = data ?? [];
  // Attach usernames from profiles
  const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));
  if (!userIds.length) return rows;
  let profileRows = [];
  try {
    const result = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);
    if (result.error) throw result.error;
    profileRows = result.data ?? [];
  } catch (e) {
    // Graceful degradation: if profiles cannot be read (e.g., RLS or anon env),
    // still return comments with a fallback username.
    profileRows = [];
  }
  const byId = new Map(profileRows.map((p) => [p.id, p.username]));
  return rows.map((r) => ({ ...r, username: byId.get(r.user_id) || 'Anonymous' }));
}

export async function addComment(dishId, body) {
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id;
  if (!userId) throw new Error('Not signed in');
  return supabase.from('comments').insert({
    dish_id: dishId,
    user_id: userId,
    body
  });
}

export async function listLeaderboard(limit = 10) {
  const { data: ratingRows, error: ratingsError } = await supabase.from('ratings').select('dish_id, score');
  if (ratingsError) throw ratingsError;

  const statsByDish = new Map();
  for (const row of ratingRows ?? []) {
    if (!row || row.dish_id == null || typeof row.score !== 'number') continue;
    const existing = statsByDish.get(row.dish_id) ?? { total: 0, count: 0 };
    statsByDish.set(row.dish_id, { total: existing.total + row.score, count: existing.count + 1 });
  }

  const dishIds = Array.from(statsByDish.keys());
  if (!dishIds.length) return [];

  const { data: dishRows, error: dishesError } = await supabase
    .from('dishes')
    .select('id, name, station_id, stations ( id, name, dining_halls ( id, name, slug ) )')
    .in('id', dishIds);
  if (dishesError) throw dishesError;

  const entries = (dishRows ?? []).map((row) => {
    const stats = statsByDish.get(row.id) ?? { total: 0, count: 0 };
    const avg = stats.count ? stats.total / stats.count : 0;
    const station = row.stations;
    return {
      dishId: row.id,
      dishName: row.name,
      stationId: station?.id ?? null,
      stationName: station?.name ?? '',
      hallName: station?.dining_halls?.name ?? '',
      hallSlug: station?.dining_halls?.slug ?? '',
      avg,
      count: stats.count
    };
  });

  return entries.sort((a, b) => b.avg - a.avg).slice(0, limit);
}

export async function getHallRating(hallSlug) {
  // 1) Stations for this hall
  const { data: stationRows, error: stationsError } = await supabase
    .from('stations')
    .select('id, dining_halls!inner(slug)')
    .eq('dining_halls.slug', hallSlug);
  if (stationsError) throw stationsError;
  const stationIds = (stationRows ?? []).map((row) => row.id);
  if (!stationIds.length) return { avg: 0, count: 0 };

  // 2) Dishes for these stations
  const { data: dishRows, error: dishesError } = await supabase
    .from('dishes')
    .select('id, station_id')
    .in('station_id', stationIds);
  if (dishesError) throw dishesError;
  const dishIds = (dishRows ?? []).map((row) => row.id);
  if (!dishIds.length) return { avg: 0, count: 0 };

  // 3) Ratings for these dishes
  const { data: ratingRows, error: ratingsError } = await supabase.from('ratings').select('score').in('dish_id', dishIds);
  if (ratingsError) throw ratingsError;

  const scores = ratingRows?.map((r) => r.score).filter((s) => typeof s === 'number') ?? [];
  const count = scores.length;
  const total = scores.reduce((sum, s) => sum + s, 0);
  return { avg: count ? total / count : 0, count };
}
