-- CSA Efficiency Dashboard — initial schema

create table if not exists use_cases (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  problem          text,
  solution         text,
  priority         text check (priority in ('P0','P1','P2')),
  status           text check (status in ('Not Started','In Progress','Blocked','Complete')) default 'Not Started',
  hours_per_week   numeric default 0,
  hours_per_quarter numeric default 0,
  build_hours      numeric default 0,
  roi              numeric,
  confidence       text,
  type             text,
  display_order    int default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table if not exists tasks (
  id               uuid primary key default gen_random_uuid(),
  use_case_id      uuid references use_cases(id) on delete cascade not null,
  name             text not null,
  percent_complete int default 0 check (percent_complete between 0 and 100),
  is_complete      boolean default false,
  category         text,
  start_date       date,
  end_date         date,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger use_cases_updated_at
  before update on use_cases
  for each row execute function update_updated_at();

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- RLS
-- Auth is handled by NextAuth at the proxy level, not Supabase Auth.
-- All requests reaching the DB come from authenticated app users, so we
-- allow both anon and authenticated roles (anon key is used client-side).
alter table use_cases enable row level security;
alter table tasks enable row level security;

create policy "App users read use_cases"
  on use_cases for select to anon, authenticated using (true);

create policy "App users write use_cases"
  on use_cases for all to anon, authenticated using (true) with check (true);

create policy "App users read tasks"
  on tasks for select to anon, authenticated using (true);

create policy "App users write tasks"
  on tasks for all to anon, authenticated using (true) with check (true);
