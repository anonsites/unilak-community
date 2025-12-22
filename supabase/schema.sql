backend

======================= BACKEDND STRUCTURE =========================================

========================== CREATE TABLES ===========================================



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



2 — TOPICS TABLE
================================================================================================

--main review categories


create table topics_table (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamp with time zone default now()
);


3 — SUBTOPICS TABLE
================================================================================================
--depends on topics

create table subtopics_table (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid references topics_table(id) on delete cascade,
  name text not null,
  created_at timestamp with time zone default now()
);




4 — REVIEWS TABLE
================================================================================================
--core of the platform

create table reviews_table (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles_table(id) on delete cascade,
  topic_id uuid references topics_table(id),
  subtopic_id uuid references subtopics_table(id),
  type text check (type in ('positive', 'negative')) not null,
  content text not null,
  recommendation text,
  created_at timestamp with time zone default now()
);

# INDEXES ON reviews_table
===============================================================================================

create index reviews_topic_idx on reviews_table(topic_id);
create index reviews_created_idx on reviews_table(created_at desc);



5 — ANNOUNCEMENTS TABLE
==============================================================================================
--home + reviews page notice


create table announcements_table (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  phone text,
  created_at timestamp with time zone default now()
);


6 — DID YOU KNOW TABLE
===============================================================================================

create table did_you_know_table (
  id uuid primary key default gen_random_uuid(),
  message text not null,
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


8 — REPORTS TABLE
===============================================================================================

create table reports_table (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews_table(id) on delete cascade,
  user_id uuid references profiles_table(id) on delete set null,
  reason text not null,
  created_at timestamp with time zone default now()
);



==================================== ROW LEVEL SECURITY (RLS)==================================




### Enable RLS on all tables


alter table profiles_table enable row level security;
alter table reviews_table enable row level security;
alter table announcements_table enable row level security;
alter table did_you_know_table enable row level security;
alter table feedback_table enable row level security;
alter table reports_table enable row level security;




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



### RLS POLICIES on Reviews


create policy "Public read reviews"
on reviews_table for select
using (true);

create policy "Authenticated users can insert reviews"
on reviews_table for insert
with check (auth.uid() = user_id);

create policy "Owner can update review"
on reviews_table for update
using (auth.uid() = user_id);

create policy "Owner can delete review"
on reviews_table for delete
using (auth.uid() = user_id);


create policy "Moderators can delete reviews"
on reviews_table for delete
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);


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


### RLS POLICIES on Did You Know

create policy "Public read did_you_know"
on did_you_know_table for select
using (true);

create policy "Moderators can insert did_you_know"
on did_you_know_table for insert
with check (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

create policy "Moderators can update did_you_know"
on did_you_know_table for update
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);


### RLS POLICIES on Feedback


create policy "Anyone can submit feedback"
on feedback_table for insert
with check (true);


### RLS POLICIES on REPORTS

create policy "Authenticated users can insert reports"
on reports_table for insert
with check (auth.role() = 'authenticated');

create policy "Moderators can view reports"
on reports_table for select
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

create policy "Moderators can delete reports"
on reports_table for delete
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);


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




============================ INSERT DATA =========================================



### topics_table
===================================================================================

insert into topics_table (name) values
('LEADERSHIP'),
('LECTURERS'),
('STUDENTS'),
('WEEK OF PRAYER'),
('TECHNOLOGY'),
('KNOWLEDGE'),
('OTHER SERVICES');


### subtopics_table
===================================================================================

#### LECTURERS
===================================================================================

insert into subtopics_table (topic_id, name)
select id, 'Secret' from topics_table where name = 'LECTURERS';

insert into subtopics_table (topic_id, name)
select id, 'All' from topics_table where name = 'LECTURERS';


#### LEADERSHIP
====================================================================================

insert into subtopics_table (topic_id, name)
select id, unnest(array[
  'Secret',
  'Principal',
  'Dean of Studies',
  'Recovery Office',
  'HOD CIS',
  'HOD ESM',
  'Security',
  'IT Office'
]) from topics_table where name = 'LEADERSHIP';


#### TECHNOLOGY
=====================================================================================

insert into subtopics_table (topic_id, name)
select id, unnest(array[
  'MIS / Elearning',
  'Smart Attendance',
  'Smart Boards',
  'Network / WIFI',
  'Other'
]) from topics_table where name = 'TECHNOLOGY';


#### WEEK OF PRAYER 
======================================================================================

insert into subtopics_table (topic_id, name)
select id, 'General'
from topics_table
where name = 'WEEK OF PRAYER';



#### STUDENTS
=======================================================================================

insert into subtopics_table (topic_id, name)
select id, unnest(array[
  'Secret',
  'All',
  'International Students',
  'Rwandan Students'
]) from topics_table where name = 'STUDENTS';


#### KNOWLEDGE
======================================================================================
insert into subtopics_table (topic_id, name)
select id, 'General' from topics_table where name = 'KNOWLEDGE';


#### OTHER SERVICES
=======================================================================================

insert into subtopics_table (topic_id, name)
select id, 'General' from topics_table where name = 'OTHER SERVICES';


9 — ANNOUNCEMENT REQUESTS TABLE
=======================================================================================

create table announcement_requests_table (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles_table(id) on delete set null,
  content text not null,
  phone text,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

alter table announcement_requests_table enable row level security;

create policy "Anyone can insert announcement requests"
on announcement_requests_table for insert
with check (true);

create policy "Moderators can view announcement requests"
on announcement_requests_table for select
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

create policy "Public can view approved announcement requests"
on announcement_requests_table for select
using (status = 'approved');

create policy "Users can view own announcement requests"
on announcement_requests_table for select
using (auth.uid() = user_id);

create policy "Moderators can update announcement requests"
on announcement_requests_table for update
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

create policy "Moderators can delete announcement requests"
on announcement_requests_table for delete
using (
  exists (
    select 1 from profiles_table
    where profiles_table.id = auth.uid()
    and profiles_table.role = 'moderator'
  )
);

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

-- Link announcements back to requests for "My Announcements" tracking
alter table announcements_table 
add column request_id uuid references announcement_requests_table(id) on delete cascade;


10 — ANNOUNCEMENT RESPONSES TABLE
=======================================================================================

create table announcement_responses_table (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid references announcements_table(id) on delete cascade,
  request_id uuid references announcement_requests_table(id) on delete cascade,
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

create policy "Request owners can update announcement responses"
on announcement_responses_table for update
using (
  exists (
    select 1 from announcement_requests_table
    where announcement_requests_table.id = announcement_responses_table.request_id
    and announcement_requests_table.user_id = auth.uid()
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


-- 3. Allow moderators to DELETE 'Did You Know' Facts
-- (Used in app/moderator/did-you-know/create/page.tsx)

CREATE POLICY "Moderators can delete facts"
ON public.did_you_know_table
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles_table
    WHERE profiles_table.id = auth.uid()
    AND profiles_table.role = 'moderator'
  )
);


-- TRIGGER: CLEANUP USER DATA ON DELETE
create or replace function delete_old_profile_data()
returns trigger as $$
begin
  -- Delete requests (cascades to announcements) and reports
  delete from public.announcement_requests_table where user_id = old.id;
  delete from public.reports_table where user_id = old.id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_profile_delete
before delete on public.profiles_table
for each row execute function delete_old_profile_data();


-- ENABLE REALTIME FOR CHAT
alter publication supabase_realtime add table announcement_responses_table, announcement_requests_table;

=============================== END ====================================================
