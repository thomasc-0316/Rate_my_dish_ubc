-- Dining halls available for rating.
create table if not exists dining_halls (
  id bigserial primary key,
  name text not null,
  slug text unique not null
);

-- Stations belong to a hall.
create table if not exists stations (
  id bigserial primary key,
  hall_id bigint not null references dining_halls(id) on delete cascade,
  name text not null,
  slug text not null,
  unique (hall_id, slug)
);

-- Dishes offered at stations.
create table if not exists dishes (
  id bigserial primary key,
  station_id bigint not null references stations(id) on delete cascade,
  name text not null,
  description text
);

-- Ratings one per (user,dish).
create table if not exists ratings (
  id bigserial primary key,
  dish_id bigint not null references dishes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score int2 not null check (score between 1 and 5),
  created_at timestamptz default now(),
  unique (dish_id, user_id)
);

-- Free-text comments on dishes.
create table if not exists comments (
  id bigserial primary key,
  dish_id bigint not null references dishes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz default now()
);

-- Daily menu entries: which dishes are offered, where, and when.
create table if not exists menu_entries (
  id bigserial primary key,
  date date not null,
  meal text not null check (meal in ('breakfast', 'lunch', 'dinner')),
  hall_id bigint not null references dining_halls(id) on delete cascade,
  station_id bigint not null references stations(id) on delete cascade,
  dish_id bigint not null references dishes(id) on delete cascade,
  unique (date, meal, station_id, dish_id)
);


-- RLS notes:
-- enable row level security on ratings, comments.
-- policy: select true for authenticated.
-- policy: insert/update allowed only when auth.uid() = user_id.
