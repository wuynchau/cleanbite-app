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
