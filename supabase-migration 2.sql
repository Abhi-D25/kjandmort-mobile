-- KJ & Mort migration — paste into Supabase Dashboard > SQL Editor > Run
-- (verified against live data on 2026-08-25: 194 countries, 6 rows with
--  3-letter codes, no duplicate names/codes)

-- 1) Normalize the six 3-letter country codes to 2-letter (ISO alpha-2),
--    matching the other 188 rows. Restaurants reference countries by uuid,
--    so no restaurant rows need touching.
update countries set country_code = 'FR' where country_code = 'FRA';
update countries set country_code = 'IN' where country_code = 'IND';
update countries set country_code = 'IT' where country_code = 'ITA';
update countries set country_code = 'JP' where country_code = 'JPN';
update countries set country_code = 'MX' where country_code = 'MEX';
update countries set country_code = 'TH' where country_code = 'THA';

-- 2) Categorized "items devoured" column. Legacy free text stays in
--    items_devoured; new/edited entries write JSON here, e.g.
--    {"appetizers":["Gyoza"],"entrees":["Ramen","Katsu"],"drinks":[],"dessert":["Mochi"]}
alter table restaurants add column if not exists items jsonb;

-- 3) Verify (both should return 0 rows / the new column):
select country_code, name from countries where length(country_code) <> 2;
select column_name, data_type from information_schema.columns
  where table_name = 'restaurants' and column_name = 'items';
