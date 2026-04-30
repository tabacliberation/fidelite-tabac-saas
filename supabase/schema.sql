-- ============================================================
-- SCHEMA MULTI-TENANT - Fidélité Tabac SaaS
-- ============================================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLE SHOPS (coeur du multi-tenant)
-- ============================================================
create table shops (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null, -- sous-domaine : slug.fidelitetabac.fr
  address text,
  phone text,
  hours jsonb, -- { "lun": "06:00-19:30", "dim": "fermé", ... }
  logo_url text,
  admin_email text unique not null,
  admin_password_hash text, -- PIN admin chiffré
  subscription_status text not null default 'trial', -- trial | active | past_due | canceled
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz default (now() + interval '14 days'),
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE PROFILES (clients des buralistes)
-- ============================================================
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  phone text not null,
  birth_date date,
  push_subscription jsonb,
  pin_attempts smallint default 0,
  pin_locked boolean default false,
  created_at timestamptz default now(),
  unique(shop_id, phone)
);

-- ============================================================
-- TABLE OFFERS (cartes de fidélité à tampons)
-- ============================================================
create table offers (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  title text not null,
  description text,
  required_points integer not null default 10,
  reward text,
  icon text default 'Gift',
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE SIMPLE_OFFERS (promotions sans tampons)
-- ============================================================
create table simple_offers (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  title text not null,
  description text,
  reward text,
  icon text default 'Tag',
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TABLE LOYALTY_CARDS (progression des clients)
-- ============================================================
create table loyalty_cards (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  offer_id uuid not null references offers(id) on delete cascade,
  current_points integer default 0,
  completed_count integer default 0,
  last_updated timestamptz default now(),
  unique(shop_id, profile_id, offer_id)
);

-- ============================================================
-- TABLE ADMIN_SETTINGS (paramètres par shop)
-- ============================================================
create table admin_settings (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null unique references shops(id) on delete cascade,
  pin_code text not null default '1234',
  shop_name text not null default 'Mon Tabac',
  updated_at timestamptz default now()
);

-- ============================================================
-- TABLE WHEEL_WINS (gains roue de la chance)
-- ============================================================
create table wheel_wins (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  profile_id uuid references profiles(id) on delete set null,
  prize text not null,
  won_at timestamptz default now(),
  collected boolean default false
);

-- ============================================================
-- TABLE CLIENT_NOTIFICATIONS (historique notifications)
-- ============================================================
create table client_notifications (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid not null references shops(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  image text,
  url text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Nettoyage automatique après 48h
create or replace function delete_old_notifications() returns trigger as $$
begin
  delete from client_notifications where created_at < now() - interval '48 hours';
  return new;
end;
$$ language plpgsql;

create trigger cleanup_notifications
after insert on client_notifications
execute function delete_old_notifications();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table shops enable row level security;
alter table profiles enable row level security;
alter table offers enable row level security;
alter table simple_offers enable row level security;
alter table loyalty_cards enable row level security;
alter table admin_settings enable row level security;
alter table wheel_wins enable row level security;
alter table client_notifications enable row level security;

-- Policies permissives (l'isolation est gérée côté API via shop_id)
create policy "public read shops" on shops for select using (true);
create policy "service insert shops" on shops for insert with check (true);
create policy "service update shops" on shops for update using (true);

create policy "public read profiles" on profiles for select using (true);
create policy "public insert profiles" on profiles for insert with check (true);
create policy "public update profiles" on profiles for update using (true);

create policy "public read offers" on offers for select using (true);
create policy "public all offers" on offers for all using (true);

create policy "public read simple_offers" on simple_offers for select using (true);
create policy "public all simple_offers" on simple_offers for all using (true);

create policy "public read loyalty_cards" on loyalty_cards for select using (true);
create policy "public all loyalty_cards" on loyalty_cards for all using (true);

create policy "public read admin_settings" on admin_settings for select using (true);
create policy "public all admin_settings" on admin_settings for all using (true);

create policy "public read wheel_wins" on wheel_wins for select using (true);
create policy "public all wheel_wins" on wheel_wins for all using (true);

create policy "public read notifications" on client_notifications for select using (true);
create policy "public all notifications" on client_notifications for all using (true);

-- ============================================================
-- STORAGE BUCKET (images des offres)
-- ============================================================
insert into storage.buckets (id, name, public) values ('offer-images', 'offer-images', true)
on conflict do nothing;

create policy "public read offer-images" on storage.objects for select using (bucket_id = 'offer-images');
create policy "public upload offer-images" on storage.objects for insert with check (bucket_id = 'offer-images');
create policy "public update offer-images" on storage.objects for update using (bucket_id = 'offer-images');
create policy "public delete offer-images" on storage.objects for delete using (bucket_id = 'offer-images');
