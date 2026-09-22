import { createHash, timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { claimOriginAllowed } from "@/lib/origin"
import { redisFromEnv } from "@/lib/redis"

export { claimOriginAllowed }

const CLAIM_WINDOW_SEC = 60
const CLAIM_LIMIT = 20
const RATE_KEY_PREFIX = "yeet:rl:claim:"

const memoryBuckets = new Map<string, { count: number; resetAt: number }>()

export type ClaimGuardFailure = {
  response: NextResponse
}

function claimToken(): string | null {
  const token = process.env.YEET_CLAIM_TOKEN?.trim()
  return token || null
}

function offeredClaimToken(request: Request): string | null {
  const header = request.headers.get("x-yeet-claim-token")?.trim()
  if (header) return header

  const authorization = request.headers.get("authorization")
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    const token = authorization.slice(7).trim()
    return token || null
  }

  return null
}

function tokensMatch(expected: string, offered: string): boolean {
  const left = createHash("sha256").update(expected).digest()
  const right = createHash("sha256").update(offered).digest()
  return timingSafeEqual(left, right)
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }

  const real = request.headers.get("x-real-ip")?.trim()
  if (real) return real

  return "unknown"
}

function memoryRateLimit(ip: string): { ok: boolean; retryAfterSec: number } {
  const now = Date.now()
  if (memoryBuckets.size > 512) {
    for (const [key, bucket] of memoryBuckets) {
      if (bucket.resetAt <= now) memoryBuckets.delete(key)
    }
  }

  const existing = memoryBuckets.get(ip)

  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(ip, {
      count: 1,
      resetAt: now + CLAIM_WINDOW_SEC * 1000,
    })
    return { ok: true, retryAfterSec: CLAIM_WINDOW_SEC }
  }

  existing.count += 1
  const retryAfterSec = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000),
  )
  return { ok: existing.count <= CLAIM_LIMIT, retryAfterSec }
}

export async function claimRateLimit(
  ip: string,
): Promise<{ ok: boolean; retryAfterSec: number }> {
  const redis = redisFromEnv()
  if (!redis) {
    return memoryRateLimit(ip)
  }

  const key = `${RATE_KEY_PREFIX}${ip}`
  const count = Number(await redis.incr(key))
  if (count === 1) {
    await redis.expire(key, CLAIM_WINDOW_SEC)
  }

  return {
    ok: count <= CLAIM_LIMIT,
    retryAfterSec: CLAIM_WINDOW_SEC,
  }
}

export function assertClaimToken(request: Request): ClaimGuardFailure | null {
  const expected = claimToken()
  if (!expected) return null

  const offered = offeredClaimToken(request)
  if (!offered || !tokensMatch(expected, offered)) {
    return {
      response: NextResponse.json(
        { error: "claim not allowed." },
        { status: 401 },
      ),
    }
  }

  return null
}

export function assertClaimOrigin(request: Request): ClaimGuardFailure | null {
  if (claimOriginAllowed(request)) return null
  return {
    response: NextResponse.json(
      { error: "claim not allowed from this origin." },
      { status: 403 },
    ),
  }
}

export async function assertClaimRateLimit(
  request: Request,
): Promise<ClaimGuardFailure | null> {
  const result = await claimRateLimit(clientIp(request))
  if (result.ok) return null
  return {
    response: NextResponse.json(
      { error: "too many yeets. wait a bit." },
      {
        status: 429,
        headers: { "retry-after": String(result.retryAfterSec) },
      },
    ),
  }
}
