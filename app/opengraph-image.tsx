import { ImageResponse } from "next/og"

export const alt = "yeet. last click owns the page."
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
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
              fontSize: 128,
              fontWeight: 500,
              letterSpacing: -3,
              lineHeight: 1,
              textTransform: "lowercase",
            }}
          >
            yeet
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 32,
              color: "#a3a3a3",
              textTransform: "lowercase",
            }}
          >
            last click owns the page
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingBottom: 56,
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
        </div>
      </div>
    ),
    { ...size },
  )
}
