import { Redis } from "@upstash/redis"

let cached: Redis | null | undefined

export function redisFromEnv(): Redis | null {
  if (cached !== undefined) return cached

  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

  cached = url && token ? new Redis({ url, token }) : null
  return cached
}
