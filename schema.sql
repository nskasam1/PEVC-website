-- Enable UUID generation
create extension if not exists "pgcrypto";

-- profiles (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  role text not null default 'applicant' check (role in ('admin', 'member', 'applicant')),
  avatar_url text,
  major text,
  grad_year text,
  linkedin_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- members
create table public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  club_role text,
  dues_status text not null default 'unpaid' check (dues_status in ('paid', 'unpaid', 'waived')),
  dues_amount numeric not null default 0,
  payment_date date,
  join_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- applicants
create table public.applicants (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  email text not null,
  name text not null,
  current_round text not null default 'r0' check (current_round in ('r0', 'r1', 'r2')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- applications
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  school text,
  major text,
  year text,
  gpa text,
  linkedin_url text,
  resume_url text,
  essay_answers jsonb not null default '[]',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- round_config
create table public.round_config (
  id uuid primary key default gen_random_uuid(),
  round text not null unique check (round in ('r0', 'r1', 'r2')),
  is_open boolean not null default false,
  essay_questions jsonb not null default '[]',
  case_file_url text,
  resource_links jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

-- seed default round config rows
insert into public.round_config (round) values ('r0'), ('r1'), ('r2');

-- interview_slots
create table public.interview_slots (
  id uuid primary key default gen_random_uuid(),
  round text not null check (round in ('r1', 'r2')),
  slot_datetime timestamptz not null,
  is_booked boolean not null default false,
  booked_by uuid references public.applicants(id) on delete set null,
  created_at timestamptz not null default now()
);

-- dues_records
create table public.dues_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  amount numeric not null,
  due_date date,
  paid boolean not null default false,
  paid_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- RLS: enable on all tables
alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.applicants enable row level security;
alter table public.applications enable row level security;
alter table public.round_config enable row level security;
alter table public.interview_slots enable row level security;
alter table public.dues_records enable row level security;

-- profiles: users can read/update their own row; admins can read all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- round_config: anyone authenticated can read
create policy "Authenticated can read round_config" on public.round_config for select using (auth.role() = 'authenticated');
create policy "Admins can modify round_config" on public.round_config for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- interview_slots: authenticated can read; applicants can update (book)
create policy "Authenticated can read slots" on public.interview_slots for select using (auth.role() = 'authenticated');
create policy "Admins can manage slots" on public.interview_slots for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- applicants/applications: admins full access; users can insert their own
create policy "Admins manage applicants" on public.applicants for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert applicant row" on public.applicants for insert with check (auth.role() = 'authenticated');

create policy "Admins manage applications" on public.applications for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Users can insert application" on public.applications for insert with check (auth.role() = 'authenticated');

-- members/dues: admins only
create policy "Admins manage members" on public.members for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Members can view own row" on public.members for select using (profile_id = auth.uid());

create policy "Admins manage dues" on public.dues_records for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Members can view own dues" on public.dues_records for select using (
  member_id in (select id from public.members where profile_id = auth.uid())
);
