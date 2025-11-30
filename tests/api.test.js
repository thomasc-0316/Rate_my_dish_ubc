import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getSession,
  signInWithPassword,
  signOut,
  listHalls,
  listStations,
  listDishes,
  getDish,
  getDishStats,
  addOrUpdateRating,
  listComments,
  addComment
} from '../src/api.js';
import { supabase } from '../src/lib/supabase';

vi.mock('../src/lib/supabase', () => {
  const auth = {
    getSession: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn()
  };
  const from = vi.fn();
  return { supabase: { auth, from } };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('auth helpers', () => {
  it('returns current session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: { id: 's1' } } });
    const result = await getSession();
    expect(result).toEqual({ data: { session: { id: 's1' } } });
    expect(supabase.auth.getSession).toHaveBeenCalledTimes(1);
  });

  it('signs in with email/password', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { session: 'ok' } });
    const email = 'user@example.com';
    const password = 'pw';
    await signInWithPassword(email, password);
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ email, password });
  });

  it('signs out', async () => {
    supabase.auth.signOut.mockResolvedValue({ data: null });
    await signOut();
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });
});

describe('listHalls', () => {
  it('returns halls ordered by name', async () => {
    const rows = [{ id: 1, name: 'Feast' }];
    const order = vi.fn().mockResolvedValue({ data: rows, error: null });
    const select = vi.fn().mockReturnValue({ order });
    supabase.from.mockReturnValue({ select });

    const result = await listHalls();
    expect(result).toEqual(rows);
    expect(supabase.from).toHaveBeenCalledWith('dining_halls');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('name');
  });

  it('throws when Supabase returns an error', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: new Error('boom') });
    const select = vi.fn().mockReturnValue({ order });
    supabase.from.mockReturnValue({ select });
    await expect(listHalls()).rejects.toThrow('boom');
  });
});

describe('listStations', () => {
  it('maps station rows to expected shape', async () => {
    const hallSlug = 'feast';
    const rows = [
      { id: 10, hall_id: 1, name: 'Grill', slug: 'grill', dining_halls: { slug: hallSlug } }
    ];
    const order = vi.fn().mockResolvedValue({ data: rows, error: null });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq, order });
    supabase.from.mockReturnValue({ select });

    const result = await listStations(hallSlug);
    expect(result).toEqual([{ id: 10, hall_id: 1, name: 'Grill', slug: 'grill' }]);
    expect(supabase.from).toHaveBeenCalledWith('stations');
    expect(eq).toHaveBeenCalledWith('dining_halls.slug', hallSlug);
  });
});

describe('listDishes', () => {
  it('fetches dishes for a station', async () => {
    const stationId = 5;
    const rows = [{ id: 20, station_id: stationId, name: 'Pasta' }];
    const order = vi.fn().mockResolvedValue({ data: rows, error: null });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq, order });
    supabase.from.mockReturnValue({ select });

    const result = await listDishes(stationId);
    expect(result).toEqual(rows);
    expect(eq).toHaveBeenCalledWith('station_id', stationId);
    expect(order).toHaveBeenCalledWith('name');
  });
});

describe('getDish', () => {
  it('returns null when no dish is found', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    supabase.from.mockReturnValue({ select });

    const result = await getDish(123);
    expect(result).toBeNull();
    expect(eq).toHaveBeenCalledWith('id', 123);
  });
});

describe('getDishStats', () => {
  it('computes average and count', async () => {
    const rows = [{ score: 4 }, { score: 2 }, { score: 4 }];
    const eq = vi.fn().mockReturnValue(Promise.resolve({ data: rows, error: null }));
    const select = vi.fn().mockReturnValue({ eq });
    supabase.from.mockReturnValue({ select });

    const result = await getDishStats(50);
    expect(result).toEqual({ avg: 10 / 3, count: 3 });
    expect(eq).toHaveBeenCalledWith('dish_id', 50);
  });

  it('handles missing rows gracefully', async () => {
    const eq = vi.fn().mockReturnValue(Promise.resolve({ data: null, error: null }));
    const select = vi.fn().mockReturnValue({ eq });
    supabase.from.mockReturnValue({ select });

    const result = await getDishStats(99);
    expect(result).toEqual({ avg: 0, count: 0 });
  });
});

describe('addOrUpdateRating', () => {
  it('throws when user is not signed in', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    await expect(addOrUpdateRating(1, 5)).rejects.toThrow('Not signed in');
  });

  it('upserts rating for signed-in user', async () => {
    const upsert = vi.fn().mockResolvedValue({ data: { ok: true } });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    supabase.from.mockReturnValue({ upsert });

    await addOrUpdateRating(7, 3);
    expect(supabase.from).toHaveBeenCalledWith('ratings');
    expect(upsert).toHaveBeenCalledWith(
      [{ dish_id: 7, user_id: 'user-1', score: 3 }],
      { onConflict: 'dish_id,user_id' }
    );
  });
});

describe('listComments', () => {
  it('respects default limit and sorting', async () => {
    const rows = [{ id: 1, body: 'Nice' }];
    const limit = vi.fn().mockReturnValue(Promise.resolve({ data: rows, error: null }));
    const order = vi.fn().mockReturnValue({ limit });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    supabase.from.mockReturnValue({ select });

    const result = await listComments(3);
    expect(result).toEqual(rows);
    expect(order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(limit).toHaveBeenCalledWith(20);
  });
});

describe('addComment', () => {
  it('throws when user is not signed in', async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    await expect(addComment(1, 'hello')).rejects.toThrow('Not signed in');
  });

  it('inserts comment for signed-in user', async () => {
    const insert = vi.fn().mockResolvedValue({ data: { ok: true } });
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'abc' } } });
    supabase.from.mockReturnValue({ insert });

    await addComment(12, 'tasty');
    expect(supabase.from).toHaveBeenCalledWith('comments');
    expect(insert).toHaveBeenCalledWith({ dish_id: 12, user_id: 'abc', body: 'tasty' });
  });
});
