-- Optional: merge coming-soon defaults into existing site_settings.
-- Safe to re-run. Does not flip a live shop off.

update public.site_settings
set site = coalesce(site, '{}'::jsonb) || jsonb_build_object(
  'storefrontLive', coalesce(site->>'storefrontLive', 'true')::boolean,
  'comingSoonHeadline', coalesce(
    nullif(site->>'comingSoonHeadline', ''),
    'COMING SOON'
  ),
  'comingSoonBody', coalesce(
    nullif(site->>'comingSoonBody', ''),
    'The troop is assembling. Leave your email and we will let you know when Primal Peps goes live.'
  )
)
where id = 1;
