-- Track every authenticated visit to the main dashboard
create table if not exists dashboard_opens (
  id         uuid primary key default gen_random_uuid(),
  user_email text not null,
  user_name  text,
  opened_at  timestamptz default now()
);

alter table dashboard_opens enable row level security;

-- Service role (used server-side) bypasses RLS; these policies cover the anon key
create policy "App users insert opens"
  on dashboard_opens for insert to anon, authenticated with check (true);

create policy "App users read opens"
  on dashboard_opens for select to anon, authenticated using (true);
