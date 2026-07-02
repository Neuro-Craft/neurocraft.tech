// Cloudflare Pages Function: receives lead-form submissions from the site
// and emails them via Resend (https://resend.com). Serves the route /api/contact.
//
// Required env var (Pages project → Settings → Environment variables):
//   RESEND_API_KEY   — your Resend API key
// Optional overrides:
//   CONTACT_TO       — recipient (default: dip00dip@gmail.com)
//   CONTACT_FROM     — verified sender (default: NeuroCraft <onboarding@resend.dev>)

const LEAD_LABELS = {
  contact: 'Contact / Get in touch',
  'dovira-access': 'Dovira — Request Access',
  'maivo-access': 'Maivo — Request Access',
  'capitalpilot-access': 'CapitalPilot — Request Access',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const json = (obj, status, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  })

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' })
  }

  let body
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  body = body || {}

  const email = String(body.email || '').trim()
  const type = String(body.type || 'contact')
  const honeypot = String(body.company || '').trim()

  // Honeypot field — bots fill it, humans never see it. Pretend success.
  if (honeypot) return json({ ok: true }, 200)

  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Invalid email address' }, 400)
  }

  const label = LEAD_LABELS[type] || LEAD_LABELS.contact

  const apiKey = env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set')
    return json({ error: 'Email service not configured' }, 500)
  }

  // Strip accidental wrapping quotes / whitespace from env values — a common
  // mistake when pasting a `Name <email@domain>` value into the dashboard.
  const clean = (v, fallback) => (v || fallback).trim().replace(/^["']|["']$/g, '').trim()
  const to = clean(env.CONTACT_TO, 'dip00dip@gmail.com')
  const from = clean(env.CONTACT_FROM, 'NeuroCraft <onboarding@resend.dev>')

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: email,
        subject: `New ${label} lead — ${email}`,
        text:
          `New submission from neurocraft.tech\n\n` +
          `Form:  ${label}\n` +
          `Email: ${email}\n` +
          `Type:  ${type}\n` +
          `Time:  ${new Date().toISOString()}\n`,
      }),
    })

    if (!r.ok) {
      console.error('Resend error', r.status, await r.text())
      return json({ error: 'Failed to send email' }, 502)
    }

    return json({ ok: true }, 200)
  } catch (err) {
    console.error('Contact handler error', err)
    return json({ error: 'Unexpected error' }, 500)
  }
}
