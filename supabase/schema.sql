1 — PROFILES TABLE
====================================================================================

--extends Supabase Auth


create table profiles_table (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Sequence for auto-incrementing usernames
create sequence if not exists user_username_seq;

-- FUNCTION: GET RANDOM EMOJI FOR AVATAR
====================================================================================
create or replace function get_random_emoji()
returns text as $$
declare
  emojis text[] := array[
    '😀', '😁', '😒', '😜', '😂', -- 5 Smileys
    '🐶', '🐱', '🦁', '🐯', '🐻'  -- 5 Animals
    '☕', '🍻', '🍉', '🍌', '🍊' -- 5 food & drinks
  ];
  random_index int;
begin
  random_index := floor(random() * array_length(emojis, 1)) + 1;
  return emojis[random_index];
end;
$$ language plpgsql volatile;


FUNCTION: AUTO-CREATE PROFILE ON SIGNUP
====================================================================================

create or replace function handle_new_user()
returns trigger as $$
declare
  assigned_role text;
  next_num int;
  default_avatar text;
begin
  assigned_role := coalesce(new.raw_user_meta_data->>'role', 'student');
  next_num := nextval('public.user_username_seq');
  default_avatar := public.get_random_emoji();

  insert into public.profiles_table (id, username, role, avatar_url)
  values (
    new.id,
    assigned_role || '_' || next_num,
    assigned_role,
    default_avatar
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;


TRIGGER FOR AUTH USERS
===============================================================================================

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();



5 — ANNOUNCEMENTS TABLE
==============================================================================================
--home page notice


create table announcements_table (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles_table(id) on delete set null,
  message text not null,
  phone text,
  created_at timestamp with time zone default now()
);


7 — FEEDBACK TABLE
===============================================================================================

create table feedback_table (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  names text not null,
  email text not null,
  feedback_type text not null,
  message text not null,
  created_at timestamp with time zone default now()
);


==================================== ROW LEVEL SECURITY (RLS)==================================




### Enable RLS on all tables


alter table profiles_table enable row level security;
alter table announcements_table enable row level security;
alter table feedback_table enable row level security;




### RLS POLICIES on Profiles

create policy "Public read profiles"
on profiles_table for select
using (true);

create policy "User update own profile"
on profiles_table for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "User delete own profile"
on profiles_table for delete
using (auth.uid() = id);



### RLS POLICIES on Announcements

create policy "Public read announcements"
on announcements_table for select
using (true);

create policy "Moderators can insert announcements"
on announcements_table for insert
with check (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

create policy "Authenticated users can insert announcements"
on announcements_table for insert
with check (auth.uid() = user_id);

create policy "Moderators can update announcements"
on announcements_table for update
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

create policy "Moderators can delete announcements"
on announcements_table for delete
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

create policy "Users can delete own announcements"
on announcements_table for delete
using (auth.uid() = user_id);


### RLS POLICIES on Feedback


create policy "Anyone can submit feedback"
on feedback_table for insert
with check (true);


======================== STORAGE BUCKET (AVATARS) ============================

Bucket name: avatars
Public: ✅

Policy (SQL):


create policy "Public read avatars"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Authenticated upload avatars"
on storage.objects for insert
with check (auth.role() = 'authenticated');

create policy "Authenticated update avatars"
on storage.objects for update
using (bucket_id = 'avatars' and auth.uid() = owner);

create policy "Authenticated delete avatars"
on storage.objects for delete
using (bucket_id = 'avatars' and auth.uid() = owner);




### RLS POLICIES on Feedback (Moderator Access)

create policy "Moderators can view feedback"
on feedback_table for select
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

create policy "Moderators can delete feedback"
on feedback_table for delete
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

10 — ANNOUNCEMENT RESPONSES TABLE
=======================================================================================

create table announcement_responses_table (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid references announcements_table(id) on delete cascade,
  user_id uuid references profiles_table(id) on delete cascade,
  content text not null,
  seen boolean default false,
  created_at timestamp with time zone default now()
);

alter table announcement_responses_table enable row level security;

create policy "Public read announcement responses"
on announcement_responses_table for select
using (true);

create policy "Anyone can insert announcement responses"
on announcement_responses_table for insert
with check (
  user_id is null 
  or user_id = auth.uid()
);

create policy "Users can delete own announcement responses"
on announcement_responses_table for delete
using (auth.uid() = user_id);

create policy "Moderators can delete announcement responses"
on announcement_responses_table for delete
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

create policy "Moderators can update announcement responses"
on announcement_responses_table for update
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

11 - IS MODERATOR FUNCTION
=======================================================================================
CREATE OR REPLACE FUNCTION public.is_moderator()
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Check if the current user exists in profiles_table with role 'moderator'
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles_table
    WHERE id = auth.uid()
    AND role = 'moderator'
  );
END;
$$;


-- TRIGGER: CLEANUP USER DATA ON DELETE
create or replace function delete_old_profile_data()
returns trigger as $$
begin
  return old;
end;
$$ language plpgsql security definer;

create trigger on_profile_delete
before delete on public.profiles_table
for each row execute function delete_old_profile_data();


-- ENABLE REALTIME FOR CHAT
alter publication supabase_realtime add table announcement_responses_table, announcements_table;

=============================== END ====================================================
