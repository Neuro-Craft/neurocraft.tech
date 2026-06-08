# Maintaining the NeuroCraft website

This is the runbook for updating **neurocraft.tech**. It's written so a coding agent
(or you) can make common changes without re-explaining the project. If you're an agent:
read this file first, then make the change.

---

## What this repo is

- A **single, self-contained marketing site** — everything lives in **`src/index.html`**
  (inline CSS + JS, no build step, no framework).
- It's a tiny **hash-routed SPA**: a company hub at `#/` plus one "view" per product
  (`#dovira`, `#dronesim`, …). Switching views is handled by a small router in the
  inline `<script>` at the bottom of `src/index.html`.
- **Contact/lead forms** POST to **`functions/api/contact.js`** — a Cloudflare Pages
  Function that emails submissions via **Resend**.
- **`src/_redirects`** is the SPA fallback (`/* → /index.html 200`); `/api/*` is the function.

## Hosting (don't need to touch this for content changes)

- **Cloudflare Pages** project `neurocraft-6tj`, builds **`main`**, build output dir = **`src`**,
  no build command. Domain: `neurocraft.tech` (+ `www`).
- Resend env vars live in the Pages project → Settings → Environment variables:
  `RESEND_API_KEY` (required), optional `CONTACT_FROM` / `CONTACT_TO` — **enter values
  without surrounding quotes**.
- **Deploy = push to `main`.** Cloudflare auto-builds and deploys. Other branches get
  preview URLs.

---

## Task: Add a new product

Everything is in **`src/index.html`**. There are three edits, all driven off a product
**slug** (a short lowercase id, e.g. `falcon`). Use an existing product as the template.

**1. Add it to the `PRODUCTS` registry** (drives the hub card + nav automatically). Each entry:

```js
{
  slug: 'falcon',                         // url id -> #falcon
  name: 'Falcon',
  status: 'live',                         // 'live' or 'soon'
  color: '#ff7a45',                       // accent hex for the hub card
  tagline: 'One-line product tagline',
  blurb: 'Two-sentence description for the hub card.',
  tags: ['Tag A', 'Tag B'],
}
```

**2. Add a matching `THEMES` entry** (per-view accent + browser tab title):

```js
falcon: {
  title: 'NeuroCraft Falcon — short description',
  accent: ['#ff7a45', '#ff7a4545', '#ff7a4518'], // [accent, accent+'45', accent+'18']
}
```
The accent array is `[hex, hex+"45", hex+"18"]` — the same hex with `45` / `18` alpha
suffixes (8-digit hex). The router applies it to the whole view automatically.

**3. Add the product's page** — copy an existing `<section class="view" data-view="…">`
block (the **`dronesim`** one is the simplest template) and change `data-view="falcon"`,
the hero text, the feature cards, etc. Keep the `<a class="back-link" href="#/">← All
products</a>` at the top.

That's it. The hub card, nav, routing, accent theming, and scroll animations all wire up
from those edits. To launch as "coming soon" instead, set `status: 'soon'` and you can
skip step 3 (the card renders disabled).

### (Optional) Give the product a working "Request Access" form

If the new product page has a lead form, do three small things so its emails are tagged:

1. **Form markup** — copy an existing form and set its slug-based lead type:
   ```html
   <form class="cta-form reveal reveal-delay-2" data-lead="falcon-access">
     <input type="text" class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" />
     <input type="email" class="cta-input" placeholder="your@email.com" required />
     <button type="submit" class="btn-primary">Request Access</button>
   </form>
   ```
   (The hidden `.hp` input is a spam honeypot — keep it.)
2. **`src/index.html`** — add the success label to `LEAD_SUCCESS`:
   `'falcon-access': 'REQUESTED ✓',`
3. **`functions/api/contact.js`** — add the email subject label to `LEAD_LABELS`:
   `'falcon-access': 'Falcon — Request Access',`

Lead types already wired: `contact`, `dovira-access`, `dronesim-access`.

---

## Task: Change copy (headlines, slogans, descriptions)

All text is in `src/index.html`. Each product's page is under its
`<section ... data-view="…">`. A highlighted word uses `<em>…</em>` (renders in the
view's accent color). Example — the Drone Simulator slogan:
`<h1>Practice real flight,<br /><em>risk-free.</em></h1>`.

---

## Test, then ship

```bash
# Static preview (no contact API):
python3 -m http.server -d src 8765        # http://localhost:8765/

# Full preview incl. the /api/contact function:
npx wrangler pages dev src
```
Check: the new hub card appears, clicking it routes to the product page with the right
accent, and (if added) the form shows "SENDING… → REQUESTED ✓".

Then commit and **push to `main`** — Cloudflare deploys automatically. Verify live at
`https://neurocraft.tech`.

---

## Prompt template for next time

Paste something like this (the agent reads this file for the rest of the context):

> Read `MAINTENANCE.md`, then add a new product to the NeuroCraft website.
> - Name: **Falcon**
> - Tagline: …
> - What it is (for the hub blurb): …
> - Tags: …, …
> - Page sections / features to highlight: …
> - Accent color: … (or "pick one that fits")
> - Status: live  (or "coming soon")
> - Needs a Request Access form: yes/no
> Test it, then commit and push to main.
