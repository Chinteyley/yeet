import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { Redis } from "@upstash/redis"

export type Throne = {
  name: string
  claimedAt: number
}

const THRONE_KEY = "yeet:throne"
const LOCAL_FILE = path.join(process.cwd(), ".data", "throne.json")

export type StoreKind = "redis" | "file" | "none"

function redisFromEnv(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

  if (!url || !token) return null
  return new Redis({ url, token })
}

export function storeKind(): StoreKind {
  if (redisFromEnv()) return "redis"
  if (!process.env.VERCEL) return "file"
  return "none"
}

function isThrone(value: unknown): value is Throne {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  return typeof record.name === "string" && typeof record.claimedAt === "number"
}

async function readLocal(): Promise<Throne | null> {
  try {
    const raw = await readFile(LOCAL_FILE, "utf8")
    const parsed: unknown = JSON.parse(raw)
    return isThrone(parsed) ? parsed : null
  } catch {
    return null
  }
}

async function writeLocal(throne: Throne): Promise<Throne> {
  await mkdir(path.dirname(LOCAL_FILE), { recursive: true })
  await writeFile(LOCAL_FILE, JSON.stringify(throne), "utf8")
  return throne
}

export async function getThrone(): Promise<Throne | null> {
  const redis = redisFromEnv()
  if (redis) {
    const value = await redis.get<Throne>(THRONE_KEY)
    return isThrone(value) ? value : null
  }

  if (storeKind() === "file") {
    return readLocal()
  }

  return null
}

export async function setThrone(throne: Throne): Promise<Throne> {
  const redis = redisFromEnv()
  if (redis) {
    await redis.set(THRONE_KEY, throne)
    return throne
  }

  if (storeKind() === "file") {
    return writeLocal(throne)
  }

  throw new Error("no durable store")
}
