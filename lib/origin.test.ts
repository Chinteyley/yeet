import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { claimOriginAllowed } from "./origin"

function post(url: string, headers: HeadersInit = {}): Request {
  return new Request(url, { method: "POST", headers })
}

describe("claimOriginAllowed", () => {
  it("allows same-origin browser posts", () => {
    const request = post("https://yeet.ctey.dev/api/throne", {
      origin: "https://yeet.ctey.dev",
    })
    assert.equal(claimOriginAllowed(request), true)
  })

  it("allows the live site origin and a matching preview host", () => {
    const liveOnPreview = post(
      "https://yeet-git-preview.vercel.app/api/throne",
      { origin: "https://yeet.ctey.dev" },
    )
    const preview = post("https://yeet-git-preview.vercel.app/api/throne", {
      origin: "https://yeet-git-preview.vercel.app",
    })
    assert.equal(claimOriginAllowed(liveOnPreview), true)
    assert.equal(claimOriginAllowed(preview), true)
  })

  it("rejects a cross-origin post", () => {
    const request = post("https://yeet.ctey.dev/api/throne", {
      origin: "https://evil.example",
    })
    assert.equal(claimOriginAllowed(request), false)
  })

  it("does not treat a missing origin as allow", () => {
    const request = post("https://yeet.ctey.dev/api/throne")
    assert.equal(claimOriginAllowed(request), false)
  })

  it("rejects missing origin when fetch metadata says cross-site", () => {
    const request = post("https://yeet.ctey.dev/api/throne", {
      "sec-fetch-site": "cross-site",
    })
    assert.equal(claimOriginAllowed(request), false)
  })

  it("allows missing origin only for same-site fetch metadata", () => {
    const sameOrigin = post("https://yeet.ctey.dev/api/throne", {
      "sec-fetch-site": "same-origin",
    })
    const sameSite = post("https://yeet.ctey.dev/api/throne", {
      "sec-fetch-site": "same-site",
    })
    const none = post("https://yeet.ctey.dev/api/throne", {
      "sec-fetch-site": "none",
    })
    assert.equal(claimOriginAllowed(sameOrigin), true)
    assert.equal(claimOriginAllowed(sameSite), true)
    assert.equal(claimOriginAllowed(none), true)
  })
})
