import { supabase } from './lib/supabase';

export async function getSession() {
  return supabase.auth.getSession();
}

export async function signInWithPassword(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
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
  const { data, error } = await supabase.from('dishes').select('*').eq('station_id', stationId).order('name');
  if (error) throw error;
  return data ?? [];
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
    .select('*')
    .eq('dish_id', dishId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
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
