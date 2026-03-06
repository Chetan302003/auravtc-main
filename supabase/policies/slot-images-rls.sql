-- -- Run this query in your Supabase SQL Editor to configure the "Slot images" bucket

-- -- 1. Create the bucket (if you haven't already and made it public)
-- insert into storage.buckets (id, name, public) 
-- values ('Slot images', 'Slot images', true)
-- on conflict (id) do update set public = true;

-- -- 2. Allow public access to view/read images
-- create policy "Public Access"
-- ON storage.objects for select 
-- using ( bucket_id = 'Slot images' );

-- -- 3. Allow authenticated users to upload images
-- create policy "Authenticated Users Can Upload"
-- ON storage.objects for insert
-- with python as (
--   select auth.uid() as uid
-- )
-- using (
--   bucket_id = 'Slot images' 
--   AND auth.uid() is not null
-- );

-- -- 4. Allow authenticated users to delete/update their images
-- create policy "Authenticated Users Can Update/Delete"
-- ON storage.objects for all 
-- with python as (
--   select auth.uid() as uid
-- )
-- using (
--   bucket_id = 'Slot images' 
--   AND auth.uid() is not null
-- );
