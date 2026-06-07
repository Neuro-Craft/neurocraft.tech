# neurocraft.tech

Marketing website for [NeuroCraft](https://neurocraft.tech) — a single, self-contained
static site showcasing NeuroCraft's products (Dovira, Drone Simulator, and more).

## Structure

- `src/index.html` — the entire site (inline CSS/JS, no build step). It's a small
  hash-routed SPA: a company hub (`#/`) plus one view per product (`#dovira`,
  `#dronesim`).
- `vercel.json` — deploy config. The "build" simply copies `src/index.html` into
  `public/` and rewrites all routes to `/index.html`.

## Adding a product

Open `src/index.html` and, in the inline `<script>`:

1. Add an entry to the `PRODUCTS` array (drives the hub card + nav automatically).
2. Add a matching entry to `THEMES` (accent color set + page title).
3. Copy a `<section class="view" data-view="…">` block and fill in the content.

## Contact forms (email)

The three forms (Get in Touch + two Request Access) POST to a Vercel serverless
function at `api/contact.js`, which emails each submission via [Resend](https://resend.com).

Set these environment variables in the Vercel project (Settings → Environment Variables):

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | yes | — | Your Resend API key. |
| `CONTACT_TO` | no | `dip00dip@gmail.com` | Where submissions are delivered. |
| `CONTACT_FROM` | no | `NeuroCraft <onboarding@resend.dev>` | Sender. Use a Resend‑verified domain address (e.g. `NeuroCraft <hello@neurocraft.tech>`) once `neurocraft.tech` is verified. |

Until the domain is verified in Resend, the default `onboarding@resend.dev` sender
only delivers to the Resend account owner's email — so test with that recipient first.

To test the function locally, use `vercel dev` (plain `python3 -m http.server`
serves the static page but not the `/api` route).

## Develop locally

```bash
python3 -m http.server -d src 8765   # then open http://localhost:8765/
```

(Opening `src/index.html` directly in a browser also works — hash routing runs on `file://`.)

## Deploy

Connected to Vercel. Pushing to `main` deploys to production; branches/PRs get preview URLs.
You can also deploy from the CLI:

```bash
vercel          # preview
vercel --prod   # production
```
