import { supabase } from './lib/supabase';

export async function getSession() {
  return supabase.auth.getSession();
}

export async function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email, password) {
  return supabase.auth.signUp({ email, password });
}

export async function createProfile(username) {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) throw new Error('Not signed in');

    return supabase.from('profiles').insert({
        id: userId,
        username
    });
}

export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
    if (error) throw error;
    return data ?? null;
}

export async function getCurrentUserProfile() {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (!userId) return null;
    return getProfile(userId);
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
    .select('id, station_id, name, description, ratings(score)')
    .eq('station_id', stationId)
    .order('name');
  if (error) throw error;

  return (data ?? []).map((row) => {
    const scores = Array.isArray(row.ratings)
      ? row.ratings.map((r) => r?.score).filter((s) => typeof s === 'number')
      : [];
    const count = scores.length;
    const total = scores.reduce((sum, s) => sum + s, 0);
    const avg = count ? total / count : null;
    return {
      id: row.id,
      station_id: row.station_id,
      name: row.name,
      description: row.description,
      rating: avg,
      rating_count: count
    };
  });
}

export async function getDish(dishId) {
  const { data, error } = await supabase.from('dishes').select('*').eq('id', dishId).maybeSingle();
  if (error) throw error;
  return data ?? null;
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
    .select('*, profiles(username)')
    .eq('dish_id', dishId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((comment) => ({
    ...comment,
    username: comment.profiles?.username || 'Anonymous'
  }));
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
