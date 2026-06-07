// Vercel serverless function: receives lead-form submissions from the site
// and emails them via Resend (https://resend.com).
//
// Required env var (set in the Vercel project):
//   RESEND_API_KEY   — your Resend API key
// Optional overrides:
//   CONTACT_TO       — recipient (default: dip00dip@gmail.com)
//   CONTACT_FROM     — verified sender (default: NeuroCraft <onboarding@resend.dev>)
//
// No npm dependencies — uses the global fetch available in the Node runtime.

const LEAD_LABELS = {
  contact: 'Contact / Get in touch',
  'dovira-access': 'Dovira — Request Access',
  'dronesim-access': 'Drone Simulator — Request Access',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Body can arrive parsed or as a raw string depending on the runtime.
  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  body = body || {}

  const email = String(body.email || '').trim()
  const type = String(body.type || 'contact')
  const honeypot = String(body.company || '').trim()

  // Honeypot field — bots fill it, humans never see it. Pretend success.
  if (honeypot) return res.status(200).json({ ok: true })

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  const label = LEAD_LABELS[type] || LEAD_LABELS.contact

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set')
    return res.status(500).json({ error: 'Email service not configured' })
  }

  // Strip accidental wrapping quotes / whitespace from env values — a common
  // mistake when pasting a `Name <email@domain>` value into the dashboard.
  const clean = (v, fallback) => (v || fallback).trim().replace(/^["']|["']$/g, '').trim()
  const to = clean(process.env.CONTACT_TO, 'dip00dip@gmail.com')
  const from = clean(process.env.CONTACT_FROM, 'NeuroCraft <onboarding@resend.dev>')

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
      const detail = await r.text()
      console.error('Resend error', r.status, detail)
      return res.status(502).json({ error: 'Failed to send email' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Contact handler error', err)
    return res.status(500).json({ error: 'Unexpected error' })
  }
}
