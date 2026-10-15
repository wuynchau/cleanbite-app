-- CleanBite schema for a new Supabase project.
-- If tables already exist and contain data, back them up and compare this file
-- with the live schema before applying any changes.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  gender text default 'female',
  age integer,
  height numeric,
  weight numeric,
  medical jsonb,
  bmi numeric,
  bmr numeric,
  target_calo integer,
  water_target integer not null default 2000,
  macro_split jsonb not null default '{"carbs":50,"protein":25,"fat":25}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  water_glasses integer not null default 0 check (water_glasses between 0 and 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_logs_user_id_log_date_key unique (user_id, log_date)
);

create table if not exists public.meal_items (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid not null references public.daily_logs(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name text not null,
  quantity numeric not null default 100 check (quantity > 0),
  calories numeric not null default 0 check (calories >= 0),
  protein numeric not null default 0 check (protein >= 0),
  carbs numeric not null default 0 check (carbs >= 0),
  fat numeric not null default 0 check (fat >= 0),
  created_at timestamptz not null default now()
);

create index if not exists daily_logs_user_date_idx
  on public.daily_logs (user_id, log_date desc);
create index if not exists meal_items_daily_log_idx
  on public.meal_items (daily_log_id, created_at);

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.meal_items enable row level security;

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.daily_logs to authenticated;
grant select, insert, update, delete on public.meal_items to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "daily_logs_select_own" on public.daily_logs;
create policy "daily_logs_select_own" on public.daily_logs
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "daily_logs_insert_own" on public.daily_logs;
create policy "daily_logs_insert_own" on public.daily_logs
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "daily_logs_update_own" on public.daily_logs;
create policy "daily_logs_update_own" on public.daily_logs
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "daily_logs_delete_own" on public.daily_logs;
create policy "daily_logs_delete_own" on public.daily_logs
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "meal_items_select_own" on public.meal_items;
create policy "meal_items_select_own" on public.meal_items
  for select to authenticated using (
    exists (
      select 1 from public.daily_logs d
      where d.id = meal_items.daily_log_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "meal_items_insert_own" on public.meal_items;
create policy "meal_items_insert_own" on public.meal_items
  for insert to authenticated with check (
    exists (
      select 1 from public.daily_logs d
      where d.id = meal_items.daily_log_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "meal_items_update_own" on public.meal_items;
create policy "meal_items_update_own" on public.meal_items
  for update to authenticated using (
    exists (
      select 1 from public.daily_logs d
      where d.id = meal_items.daily_log_id and d.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.daily_logs d
      where d.id = meal_items.daily_log_id and d.user_id = auth.uid()
    )
  );

drop policy if exists "meal_items_delete_own" on public.meal_items;
create policy "meal_items_delete_own" on public.meal_items
  for delete to authenticated using (
    exists (
      select 1 from public.daily_logs d
      where d.id = meal_items.daily_log_id and d.user_id = auth.uid()
    )
  );

-- Full database administration remains in Supabase Dashboard. The app admin dashboard
-- uses a separate server-side endpoint protected by auth.users.app_metadata.role.
-- Never add a service-role key to frontend code or grant global table access to every user.
-- CleanBite: extend the existing database for AI history, PDF archive and admin dashboard.
-- Run this additive migration in Supabase SQL Editor after backing up your project.
-- It does not delete or rewrite existing profiles, daily_logs or meal_items.

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_requirements text not null default '' check (char_length(user_requirements) <= 500),
  prompt_text text not null default '',
  target_calories integer not null default 0 check (target_calories between 0 and 10000),
  target_macros jsonb not null default '{}'::jsonb,
  request_data jsonb not null default '{}'::jsonb,
  generated_menu jsonb,
  status text not null default 'processing' check (status in ('processing', 'success', 'failed')),
  error_message text,
  applied_to_log_id uuid references public.daily_logs(id) on delete set null,
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.ai_generations
  add column if not exists prompt_text text not null default '';

create index if not exists ai_generations_user_created_idx
  on public.ai_generations (user_id, created_at desc);
create index if not exists ai_generations_status_idx
  on public.ai_generations (status, created_at desc);

alter table public.ai_generations enable row level security;
grant select, insert, update, delete on public.ai_generations to authenticated;

drop policy if exists "ai_generations_select_own" on public.ai_generations;
create policy "ai_generations_select_own" on public.ai_generations
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "ai_generations_insert_own" on public.ai_generations;
create policy "ai_generations_insert_own" on public.ai_generations
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "ai_generations_update_own" on public.ai_generations;
create policy "ai_generations_update_own" on public.ai_generations
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "ai_generations_delete_own" on public.ai_generations;
create policy "ai_generations_delete_own" on public.ai_generations
  for delete to authenticated using (user_id = auth.uid());

create table if not exists public.nutrition_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_date date not null,
  file_path text not null unique,
  file_name text not null default 'CleanBite_BaoCao.pdf',
  calories numeric not null default 0 check (calories >= 0),
  protein numeric not null default 0 check (protein >= 0),
  carbs numeric not null default 0 check (carbs >= 0),
  fat numeric not null default 0 check (fat >= 0),
  water_ml integer not null default 0 check (water_ml >= 0),
  report_data jsonb not null default '{}'::jsonb,
  sent_to_email text,
  email_status text not null default 'pending' check (email_status in ('pending', 'sent', 'failed')),
  email_provider_id text,
  email_error text,
  created_at timestamptz not null default now(),
  email_sent_at timestamptz
);

create index if not exists nutrition_reports_user_created_idx
  on public.nutrition_reports (user_id, created_at desc);
create index if not exists nutrition_reports_date_idx
  on public.nutrition_reports (report_date desc);

alter table public.nutrition_reports enable row level security;
grant select, insert, update, delete on public.nutrition_reports to authenticated;

drop policy if exists "nutrition_reports_select_own" on public.nutrition_reports;
create policy "nutrition_reports_select_own" on public.nutrition_reports
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "nutrition_reports_insert_own" on public.nutrition_reports;
create policy "nutrition_reports_insert_own" on public.nutrition_reports
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "nutrition_reports_update_own" on public.nutrition_reports;
create policy "nutrition_reports_update_own" on public.nutrition_reports
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "nutrition_reports_delete_own" on public.nutrition_reports;
create policy "nutrition_reports_delete_own" on public.nutrition_reports
  for delete to authenticated using (user_id = auth.uid());

-- Keep reports private; the object path must begin with the authenticated user's UUID.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('nutrition-reports', 'nutrition-reports', false, 3145728, array['application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = 3145728,
    allowed_mime_types = array['application/pdf'];

drop policy if exists "nutrition_report_files_select_own" on storage.objects;
create policy "nutrition_report_files_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'nutrition-reports' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "nutrition_report_files_insert_own" on storage.objects;
create policy "nutrition_report_files_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'nutrition-reports' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "nutrition_report_files_update_own" on storage.objects;
create policy "nutrition_report_files_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'nutrition-reports' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'nutrition-reports' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "nutrition_report_files_delete_own" on storage.objects;
create policy "nutrition_report_files_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'nutrition-reports' and (storage.foldername(name))[1] = auth.uid()::text);

-- Admin access is granted only through Supabase Auth app_metadata (not user-editable user_metadata).
-- The server-side endpoint separately checks app_metadata.role === 'admin'.
