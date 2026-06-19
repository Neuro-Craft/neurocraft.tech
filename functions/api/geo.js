// Returns the visitor's country code, derived from Cloudflare's edge
// geolocation. Used by the site's first-visit language auto-detection
// (see the i18n block in src/index.html) to default Ukrainian visitors to UK.
export function onRequestGet({ request }) {
  const country =
    (request.cf && request.cf.country) || request.headers.get('CF-IPCountry') || 'XX'

  return new Response(JSON.stringify({ country }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      // Per-visitor + may change with location; never cache.
      'cache-control': 'no-store',
    },
  })
}
