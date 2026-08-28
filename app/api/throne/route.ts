import { NextResponse } from "next/server"
import { resolveName } from "@/lib/names"
import { getThrone, setThrone, storeKind } from "@/lib/throne"

export const dynamic = "force-dynamic"

export async function GET() {
  const throne = await getThrone()
  return NextResponse.json({
    name: throne?.name ?? null,
    claimedAt: throne?.claimedAt ?? null,
  })
}

export async function POST(request: Request) {
  if (storeKind() === "none") {
    return NextResponse.json(
      { error: "throne is offline. no store." },
      { status: 503 },
    )
  }

  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const offered =
    body && typeof body === "object" && "name" in body
      ? (body as { name?: unknown }).name
      : undefined

  const throne = await setThrone({
    name: resolveName(offered),
    claimedAt: Date.now(),
  })

  return NextResponse.json(throne)
}
