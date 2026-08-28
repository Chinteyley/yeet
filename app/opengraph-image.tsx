import { ImageResponse } from "next/og"
import { getThrone } from "@/lib/throne"

export const alt = "yeet. last click owns the page."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function Image() {
  const throne = await getThrone()
  const name = throne?.name ?? "nobody"
  const status = throne ? "is up" : "empty throne"

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#f5f5f5",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            color: "#737373",
            textTransform: "lowercase",
          }}
        >
          yeet
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: name.length > 14 ? 72 : 96,
              fontWeight: 500,
              letterSpacing: -2,
              lineHeight: 1.05,
              textTransform: "lowercase",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#a3a3a3",
              textTransform: "lowercase",
            }}
          >
            {status}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "#525252",
            textTransform: "lowercase",
          }}
        >
          last click owns the page
        </div>
      </div>
    ),
    { ...size },
  )
}
