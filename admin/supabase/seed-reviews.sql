-- Seed demo product reviews (look natural on the storefront)
-- Run in Supabase SQL Editor AFTER or AFTER products exist.
-- Safe to re-run: users + reviews upsert / skip on conflict.
--
-- To remove later:
--   delete from auth.users where email like 'seed.reviewer%@primalpeps.invalid';

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- 1) Seed reviewer accounts in auth.users (+ identities + profiles)
-- ---------------------------------------------------------------------------
do $$
declare
  reviewers jsonb := '[
    {"id":"a1000000-0000-4000-8000-000000000001","email":"seed.reviewer1@primalpeps.invalid","name":"Alex M."},
    {"id":"a1000000-0000-4000-8000-000000000002","email":"seed.reviewer2@primalpeps.invalid","name":"Jordan K."},
    {"id":"a1000000-0000-4000-8000-000000000003","email":"seed.reviewer3@primalpeps.invalid","name":"Casey R."},
    {"id":"a1000000-0000-4000-8000-000000000004","email":"seed.reviewer4@primalpeps.invalid","name":"Morgan T."},
    {"id":"a1000000-0000-4000-8000-000000000005","email":"seed.reviewer5@primalpeps.invalid","name":"Taylor S."},
    {"id":"a1000000-0000-4000-8000-000000000006","email":"seed.reviewer6@primalpeps.invalid","name":"Sam D."},
    {"id":"a1000000-0000-4000-8000-000000000007","email":"seed.reviewer7@primalpeps.invalid","name":"Riley P."},
    {"id":"a1000000-0000-4000-8000-000000000008","email":"seed.reviewer8@primalpeps.invalid","name":"Jamie L."}
  ]'::jsonb;
  r jsonb;
  uid uuid;
  em text;
  nm text;
begin
  for r in select * from jsonb_array_elements(reviewers)
  loop
    uid := (r->>'id')::uuid;
    em := r->>'email';
    nm := r->>'name';

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      uid,
      'authenticated',
      'authenticated',
      em,
      crypt('SeedReview!2026', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', nm, 'seeded_review_user', true),
      now() - ((random() * 90)::int || ' days')::interval,
      now(),
      '',
      '',
      '',
      ''
    )
    on conflict (id) do nothing;

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      uid,
      uid,
      jsonb_build_object('sub', uid::text, 'email', em),
      'email',
      uid::text,
      now(),
      now(),
      now()
    )
    on conflict do nothing;

    insert into public.profiles (id, email, full_name)
    values (uid, em, nm)
    on conflict (id) do update
      set email = excluded.email,
          full_name = excluded.full_name;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 2) Seed reviews — 1–2 per active product, natural AU-style wording
-- ---------------------------------------------------------------------------
insert into public.reviews (
  product_id, user_id, user_name, rating, body, order_id, created_at
)
select
  v.product_id,
  v.user_id,
  v.user_name,
  v.rating,
  v.body,
  null,
  now() - (v.days_ago || ' days')::interval
from (
  values
    -- Retatrutide
    ('reta', 'a1000000-0000-4000-8000-000000000001'::uuid, 'Alex M.', 5,
     'Arrived well packed and clearly labelled. Ordering was easy and tracking updates were solid.', 12),
    ('reta', 'a1000000-0000-4000-8000-000000000005'::uuid, 'Taylor S.', 5,
     'Professional packaging and quick dispatch. Product matched the listing exactly.', 41),

    -- MOTS-C
    ('mots', 'a1000000-0000-4000-8000-000000000002'::uuid, 'Jordan K.', 5,
     'Secure packaging and clear vial labelling. Smooth checkout and fast AU shipping.', 18),
    ('mots', 'a1000000-0000-4000-8000-000000000006'::uuid, 'Sam D.', 4,
     'Good quality presentation. Would like more stock options but overall a clean order.', 55),

    -- CJC + IPA
    ('cjc', 'a1000000-0000-4000-8000-000000000003'::uuid, 'Casey R.', 5,
     'Vial arrived sealed and protected. Communication was prompt throughout.', 9),
    ('cjc', 'a1000000-0000-4000-8000-000000000007'::uuid, 'Riley P.', 5,
     'Easy process from cart to delivery. Packaging was discreet and careful.', 33),

    -- GHK-Cu
    ('ghk', 'a1000000-0000-4000-8000-000000000004'::uuid, 'Morgan T.', 5,
     'Well presented and clearly labelled. Arrived in excellent condition.', 22),
    ('ghk', 'a1000000-0000-4000-8000-000000000008'::uuid, 'Jamie L.', 5,
     'Solid experience — discreet pack, tracking, and product as described.', 60),

    -- Tesamorelin
    ('tesa', 'a1000000-0000-4000-8000-000000000001'::uuid, 'Alex M.', 4,
     'Everything looked professional. Shipping took a touch longer but item was fine.', 27),
    ('tesa', 'a1000000-0000-4000-8000-000000000005'::uuid, 'Taylor S.', 5,
     'Clean labelling and secure packaging. Happy with the overall process.', 48),

    -- KLOW
    ('klow', 'a1000000-0000-4000-8000-000000000002'::uuid, 'Jordan K.', 5,
     'Blend vial arrived protected and labelled clearly. Smooth transaction.', 14),
    ('klow', 'a1000000-0000-4000-8000-000000000006'::uuid, 'Sam D.', 5,
     'Discreet packaging and accurate product info. Would order again.', 39),

    -- TB-500
    ('tb', 'a1000000-0000-4000-8000-000000000003'::uuid, 'Casey R.', 5,
     'Fast confirmation email and careful packing. Product looked spot on.', 7),
    ('tb', 'a1000000-0000-4000-8000-000000000007'::uuid, 'Riley P.', 4,
     'Good service overall. Packaging was solid and the vial was intact.', 52),

    -- BPC-157
    ('bpc', 'a1000000-0000-4000-8000-000000000004'::uuid, 'Morgan T.', 5,
     'Exactly as listed. Secure seal, clear label, no issues with shipping.', 16),
    ('bpc', 'a1000000-0000-4000-8000-000000000008'::uuid, 'Jamie L.', 5,
     'Straightforward order. Arrived sealed and well protected for research use.', 44),

    -- Cagrilintide
    ('cagri', 'a1000000-0000-4000-8000-000000000001'::uuid, 'Alex M.', 5,
     'Professional storefront experience. Packaging and labelling were excellent.', 21),
    ('cagri', 'a1000000-0000-4000-8000-000000000005'::uuid, 'Taylor S.', 4,
     'Happy with the product presentation. Delivery was on time.', 58),

    -- MT-2
    ('mt2', 'a1000000-0000-4000-8000-000000000002'::uuid, 'Jordan K.', 5,
     'Clean packaging and clear research labelling. No complaints.', 11),
    ('mt2', 'a1000000-0000-4000-8000-000000000006'::uuid, 'Sam D.', 5,
     'Arrived quickly and looked exactly like the product photos.', 36),

    -- BAC Water
    ('bac', 'a1000000-0000-4000-8000-000000000003'::uuid, 'Casey R.', 5,
     'Essential add-on. Sealed properly and shipped with the rest of the order.', 8),
    ('bac', 'a1000000-0000-4000-8000-000000000007'::uuid, 'Riley P.', 5,
     'Simple product, carefully packed. Handy to order alongside peptides.', 29),

    -- GLOW
    ('glow', 'a1000000-0000-4000-8000-000000000004'::uuid, 'Morgan T.', 5,
     'Blend arrived well protected. Label clarity and packing were top notch.', 19),
    ('glow', 'a1000000-0000-4000-8000-000000000008'::uuid, 'Jamie L.', 5,
     'Great experience end to end. Discreet pack and accurate listing.', 47),

    -- NAD+
    ('nad', 'a1000000-0000-4000-8000-000000000001'::uuid, 'Alex M.', 5,
     'Heavy vial was still packed securely. Clear labelling throughout.', 13),
    ('nad', 'a1000000-0000-4000-8000-000000000005'::uuid, 'Taylor S.', 4,
     'Solid order. Took a day longer than expected but product was fine.', 50),

    -- Semax
    ('semax', 'a1000000-0000-4000-8000-000000000002'::uuid, 'Jordan K.', 5,
     'Quick dispatch and careful packing. Product matched the description.', 10),
    ('semax', 'a1000000-0000-4000-8000-000000000006'::uuid, 'Sam D.', 5,
     'Smooth checkout and discreet delivery. Would buy again.', 42),

    -- Selank
    ('selank', 'a1000000-0000-4000-8000-000000000003'::uuid, 'Casey R.', 5,
     'New listing for me — arrived sealed, labelled, and well protected.', 6),
    ('selank', 'a1000000-0000-4000-8000-000000000007'::uuid, 'Riley P.', 4,
     'Good packaging and clear product info. Happy with the purchase.', 31),

    -- BPC + TB-500
    ('bpctb', 'a1000000-0000-4000-8000-000000000004'::uuid, 'Morgan T.', 5,
     'Convenient blend vial. Packing was secure and labelling was clear.', 17),
    ('bpctb', 'a1000000-0000-4000-8000-000000000008'::uuid, 'Jamie L.', 5,
     'Arrived in great condition. Easy order process and discreet shipping.', 45),

    -- AHK-Cu
    ('ahk', 'a1000000-0000-4000-8000-000000000001'::uuid, 'Alex M.', 5,
     'Professional presentation and careful packing. No issues at all.', 20),
    ('ahk', 'a1000000-0000-4000-8000-000000000005'::uuid, 'Taylor S.', 5,
     'Clean label, sealed vial, and fast tracking updates.', 54),

    -- KPV
    ('kpv', 'a1000000-0000-4000-8000-000000000002'::uuid, 'Jordan K.', 5,
     'Exactly as described. Packaging was discreet and secure.', 15),
    ('kpv', 'a1000000-0000-4000-8000-000000000006'::uuid, 'Sam D.', 4,
     'Good experience overall. Product arrived intact and well labelled.', 38),

    -- Adamax
    ('adamax', 'a1000000-0000-4000-8000-000000000003'::uuid, 'Casey R.', 5,
     'Sealed vial, clear branding, and prompt delivery confirmation.', 12),
    ('adamax', 'a1000000-0000-4000-8000-000000000007'::uuid, 'Riley P.', 5,
     'Smooth from checkout to door. Packaging looked premium.', 40),

    -- IGF-1 LR3
    ('igf1', 'a1000000-0000-4000-8000-000000000004'::uuid, 'Morgan T.', 5,
     'Handled carefully in transit. Label and seal looked perfect.', 23),
    ('igf1', 'a1000000-0000-4000-8000-000000000008'::uuid, 'Jamie L.', 4,
     'Happy with the order. Would appreciate more stock alerts next time.', 49),

    -- MT-1
    ('mt1', 'a1000000-0000-4000-8000-000000000001'::uuid, 'Alex M.', 5,
     'Arrived quickly and looked identical to the product page.', 8),
    ('mt1', 'a1000000-0000-4000-8000-000000000005'::uuid, 'Taylor S.', 5,
     'Discreet pack and clear research labelling. Solid experience.', 34),

    -- Tirzepatide
    ('tirz', 'a1000000-0000-4000-8000-000000000002'::uuid, 'Jordan K.', 5,
     'Both strengths options looked well presented. Packing was excellent.', 11),
    ('tirz', 'a1000000-0000-4000-8000-000000000006'::uuid, 'Sam D.', 5,
     'Fast shipping and secure vial protection. No issues whatsoever.', 37)
) as v(product_id, user_id, user_name, rating, body, days_ago)
where exists (
  select 1 from public.products p where p.id = v.product_id and p.active = true
)
on conflict (product_id, user_id) do update
  set user_name = excluded.user_name,
      rating = excluded.rating,
      body = excluded.body,
      created_at = excluded.created_at;

-- Quick check
-- select product_id, user_name, rating, left(body, 60) from public.reviews order by created_at desc;
