import { ImageResponse } from "next/og"
import { getThrone } from "@/lib/throne"

export const alt = "yeet. last click owns the page."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const dynamic = "force-dynamic"
export const revalidate = 0

function nameFontSize(name: string): number {
  const length = name.length
  if (length <= 8) return 128
  if (length <= 12) return 100
  if (length <= 16) return 80
  if (length <= 20) return 64
  return 52
}

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
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            paddingTop: 44,
            paddingLeft: 52,
            fontSize: 22,
            letterSpacing: 2,
            color: "#737373",
            textTransform: "lowercase",
          }}
        >
          yeet
        </div>

        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 72,
            paddingRight: 72,
            paddingBottom: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              maxWidth: 1056,
              fontSize: nameFontSize(name),
              fontWeight: 500,
              letterSpacing: -3,
              lineHeight: 1,
              textTransform: "lowercase",
              textAlign: "center",
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 34,
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
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 52,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 84,
              paddingLeft: 96,
              paddingRight: 96,
              borderRadius: 999,
              background: "#ffffff",
              color: "#0a0a0a",
              fontSize: 38,
              fontWeight: 500,
              textTransform: "lowercase",
            }}
          >
            yeet
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 20,
              color: "#737373",
              textTransform: "lowercase",
            }}
          >
            last click owns the page
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
