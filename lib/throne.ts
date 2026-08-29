import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { Redis } from "@upstash/redis"

export type ReignRecord = {
  name: string
  heldMs: number
}

export type Throne = {
  name: string
  claimedAt: number
  longest: ReignRecord | null
}

const THRONE_KEY = "yeet:throne"
const LOCAL_FILE = path.join(process.cwd(), ".data", "throne.json")

// Durable HTTP JSON bin used when Upstash Redis is not provisioned.
// GET is cache-busted; Redis remains the preferred store.
const JSON_BIN =
  process.env.YEET_JSON_URL ||
  "https://extendsclass.com/api/json-storage/bin/aceecac"

export type StoreKind = "redis" | "json" | "file" | "none"

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
  if (JSON_BIN) return "json"
  if (!process.env.VERCEL) return "file"
  return "none"
}

function parseLongest(value: unknown): ReignRecord | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  const longest = record.longest
  if (!longest || typeof longest !== "object") return null
  const entry = longest as Record<string, unknown>
  if (typeof entry.name !== "string" || typeof entry.heldMs !== "number") {
    return null
  }
  if (!entry.name || entry.heldMs < 0) return null
  return { name: entry.name, heldMs: entry.heldMs }
}

function parseThrone(value: unknown): Throne | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  if (typeof record.name !== "string" || typeof record.claimedAt !== "number") {
    return null
  }
  return {
    name: record.name,
    claimedAt: record.claimedAt,
    longest: parseLongest(value),
  }
}

async function readLocal(): Promise<Throne | null> {
  try {
    const raw = await readFile(LOCAL_FILE, "utf8")
    const parsed: unknown = JSON.parse(raw)
    return parseThrone(parsed)
  } catch {
    return null
  }
}

async function writeLocal(throne: Throne): Promise<Throne> {
  await mkdir(path.dirname(LOCAL_FILE), { recursive: true })
  await writeFile(LOCAL_FILE, JSON.stringify(throne), "utf8")
  return throne
}

async function readJsonBin(): Promise<Throne | null> {
  const response = await fetch(`${JSON_BIN}?t=${Date.now()}`, {
    cache: "no-store",
  })
  if (!response.ok) return null
  const parsed: unknown = await response.json()
  return parseThrone(parsed)
}

async function writeJsonBin(throne: Throne): Promise<Throne> {
  const response = await fetch(JSON_BIN, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(throne),
    cache: "no-store",
  })
  if (!response.ok) {
    throw new Error("json store write failed")
  }
  return throne
}

export async function getThrone(): Promise<Throne | null> {
  const redis = redisFromEnv()
  if (redis) {
    return parseThrone(await redis.get(THRONE_KEY))
  }

  if (storeKind() === "json") {
    return readJsonBin()
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

  if (storeKind() === "json") {
    return writeJsonBin(throne)
  }

  if (storeKind() === "file") {
    return writeLocal(throne)
  }

  throw new Error("no durable store")
}

export async function claimThrone(name: string): Promise<Throne> {
  const current = await getThrone()
  const now = Date.now()
  let longest = current?.longest ?? null

  if (current) {
    const heldMs = now - current.claimedAt
    if (!longest || heldMs > longest.heldMs) {
      longest = { name: current.name, heldMs }
    }
  }

  return setThrone({
    name,
    claimedAt: now,
    longest,
  })
}
