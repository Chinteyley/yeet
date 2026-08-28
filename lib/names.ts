const SPARE_NAMES = [
  "ghost",
  "void",
  "a raccoon",
  "some guy",
  "uncredited",
  "the intern",
  "a rumor",
  "nobody special",
  "ctrl z",
  "left on read",
  "draft",
  "anon",
  "a moth",
  "unsigned",
  "temp",
  "walk-on",
] as const

const MAX_NAME_LENGTH = 24

export function sanitizeName(raw: unknown): string | null {
  if (typeof raw !== "string") return null

  const cleaned = raw
    .toLowerCase()
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/[^a-z0-9 ._\-']/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_NAME_LENGTH)

  return cleaned || null
}

export function randomName(): string {
  const index = Math.floor(Math.random() * SPARE_NAMES.length)
  return SPARE_NAMES[index] ?? "ghost"
}

export function resolveName(raw: unknown): string {
  return sanitizeName(raw) ?? randomName()
}
