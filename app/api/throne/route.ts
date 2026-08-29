import { NextResponse } from "next/server"
import { resolveName } from "@/lib/names"
import { claimThrone, getThrone, storeKind } from "@/lib/throne"

export const dynamic = "force-dynamic"

function thronePayload(throne: Awaited<ReturnType<typeof getThrone>>) {
  return {
    name: throne?.name ?? null,
    claimedAt: throne?.claimedAt ?? null,
    longest: throne?.longest ?? null,
  }
}

export async function GET() {
  return NextResponse.json(thronePayload(await getThrone()))
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

  const throne = await claimThrone(resolveName(offered))
  return NextResponse.json(thronePayload(throne))
}
