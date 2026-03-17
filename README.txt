MenuFlow Supabase-connected patch

Manual steps you still need:
1. Run supabase_schema.sql in Supabase SQL Editor.
2. Create storage buckets: heroes, logos, menu-images.
3. Paste your Supabase URL and anon key into assets/js/supabaseClient.js.
4. Deploy to Netlify (static deploy is fine).
5. Create your owner account in Supabase Auth, then log in here.

This version removes the old local-only demo data flow and uses Supabase for:
- login
- restaurant website settings
- categories
- menu items
- public published storefront by slug
