# neurocraft.tech

Marketing website for [NeuroCraft](https://neurocraft.tech) — a single, self-contained
static site showcasing NeuroCraft's products (Dovira, Drone Simulator, CapitalPilot, and more).

## Structure

- `src/index.html` — the entire site (inline CSS/JS, no build step). It's a small
  hash-routed SPA: a company hub (`#/`) plus one view per product (`#dovira`,
  `#dronesim`, `#capitalpilot`).
- `functions/api/contact.js` — Cloudflare Pages Function backing the contact forms.
- `src/_redirects` — SPA fallback (serve `/index.html` for any non-asset, non-function route).

## Adding a product

Open `src/index.html` and, in the inline `<script>`:

1. Add an entry to the `PRODUCTS` array (drives the hub card + nav automatically).
2. Add a matching entry to `THEMES` (accent color set + page title).
3. Copy a `<section class="view" data-view="…">` block and fill in the content.

## Contact forms (email)

The four forms (Get in Touch + three Request Access) POST to `/api/contact`, served by a
Cloudflare Pages Function at `functions/api/contact.js`, which emails each submission via
[Resend](https://resend.com).

Set these environment variables in the Pages project (Settings → Environment variables):

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `RESEND_API_KEY` | yes | — | Your Resend API key. |
| `CONTACT_TO` | no | `dip00dip@gmail.com` | Where submissions are delivered. |
| `CONTACT_FROM` | no | `NeuroCraft <onboarding@resend.dev>` | Sender, in `email@domain` or `Name <email@domain>` format. Use a Resend‑verified domain address once `neurocraft.tech` is verified. Enter the value **without** surrounding quotes, e.g. `NeuroCraft <hello@neurocraft.tech>`. |

Until the domain is verified in Resend, the default `onboarding@resend.dev` sender
only delivers to the Resend account owner's email — so test with that recipient first.

To run the function locally (serves the static page **and** the `/api` route):

```bash
npx wrangler pages dev src   # functions/ is picked up automatically
```

## Develop locally

```bash
python3 -m http.server -d src 8765   # then open http://localhost:8765/
```

(Opening `src/index.html` directly in a browser also works — hash routing runs on `file://`.)

## Deploy (Cloudflare Pages)

Connect the repo as a Cloudflare Pages project with these build settings:

| Setting | Value |
| --- | --- |
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `src` |

Functions in `functions/` are detected automatically (no config). Add the env vars above,
then point the `neurocraft.tech` domain at the project under **Custom domains**.

Pushing to `main` deploys production; other branches get preview URLs. From the CLI:

```bash
npx wrangler pages deploy src   # uploads src/ + functions/
```
