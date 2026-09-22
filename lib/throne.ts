import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { redisFromEnv } from "@/lib/redis"

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

export type StoreKind = "redis" | "json" | "file" | "none"

function jsonBinUrl(): string | null {
  const raw = process.env.YEET_JSON_URL?.trim()
  if (!raw) return null
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null
    }
    return raw
  } catch {
    return null
  }
}

export function storeKind(): StoreKind {
  if (redisFromEnv()) return "redis"

  // Vercel (prod and preview) never falls through to a public JSON bin or
  // ephemeral local file. Missing Redis credentials fail closed.
  if (process.env.VERCEL) return "none"

  if (jsonBinUrl()) return "json"
  return "file"
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
  const url = jsonBinUrl()
  if (!url) return null
  const response = await fetch(`${url}?t=${Date.now()}`, {
    cache: "no-store",
  })
  if (!response.ok) return null
  const parsed: unknown = await response.json()
  return parseThrone(parsed)
}

async function writeJsonBin(throne: Throne): Promise<Throne> {
  const url = jsonBinUrl()
  if (!url) {
    throw new Error("json store write failed")
  }
  const response = await fetch(url, {
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
  const kind = storeKind()
  switch (kind) {
    case "redis": {
      const redis = redisFromEnv()
      if (!redis) return null
      return parseThrone(await redis.get(THRONE_KEY))
    }
    case "json":
      return readJsonBin()
    case "file":
      return readLocal()
    case "none":
      return null
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

export async function setThrone(throne: Throne): Promise<Throne> {
  const kind = storeKind()
  switch (kind) {
    case "redis": {
      const redis = redisFromEnv()
      if (!redis) {
        throw new Error("no durable store")
      }
      await redis.set(THRONE_KEY, throne)
      return throne
    }
    case "json":
      return writeJsonBin(throne)
    case "file":
      return writeLocal(throne)
    case "none":
      throw new Error("no durable store")
    default: {
      const _exhaustive: never = kind
      throw new Error(String(_exhaustive))
    }
  }
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
