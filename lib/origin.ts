import { siteUrl } from "@/lib/site"

export function allowedClaimOrigins(request: Request): Set<string> {
  const origins = new Set<string>()
  origins.add(siteUrl())
  origins.add(new URL(request.url).origin)

  const forwardedHost = request.headers.get("x-forwarded-host")
  const host = forwardedHost || request.headers.get("host")
  const proto =
    request.headers.get("x-forwarded-proto") ||
    new URL(request.url).protocol.replace(":", "") ||
    "https"
  if (host) {
    origins.add(`${proto}://${host}`)
  }

  const vercelUrl = process.env.VERCEL_URL?.trim()
  if (vercelUrl) {
    origins.add(`https://${vercelUrl}`)
  }

  const extras = process.env.YEET_ALLOWED_ORIGINS?.split(",") ?? []
  for (const extra of extras) {
    const trimmed = extra.trim()
    if (!trimmed) continue
    try {
      origins.add(new URL(trimmed).origin)
    } catch {
      // ignore malformed allowlist entries
    }
  }

  return origins
}

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

/**
 * Same-site rule for POST /api/throne:
 * - Origin present: must match this request, yeet.ctey.dev, VERCEL_URL, or YEET_ALLOWED_ORIGINS.
 * - Origin absent: not treated as allow. Only Sec-Fetch-Site same-origin / same-site / none
 *   is accepted (user-initiated same-document or non-web contexts). Missing Origin plus
 *   cross-site or missing fetch metadata is rejected.
 */
export function claimOriginAllowed(request: Request): boolean {
  const allowed = allowedClaimOrigins(request)
  const origin = request.headers.get("origin")

  if (origin) {
    const normalized = normalizeOrigin(origin)
    return Boolean(normalized && allowed.has(normalized))
  }

  const fetchSite = request.headers.get("sec-fetch-site")
  return (
    fetchSite === "same-origin" ||
    fetchSite === "same-site" ||
    fetchSite === "none"
  )
}
