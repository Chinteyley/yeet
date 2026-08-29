"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { uptimeLabel } from "@/lib/time"
import type { Throne } from "@/lib/throne"

type ThroneView = {
  name: string | null
  claimedAt: number | null
}

type Props = {
  initial: ThroneView
}

export function ThroneBoard({ initial }: Props) {
  const [throne, setThrone] = useState<ThroneView>(initial)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(tick)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      try {
        const response = await fetch("/api/throne", { cache: "no-store" })
        if (!response.ok) return
        const next = (await response.json()) as ThroneView
        if (!cancelled) setThrone(next)
      } catch {
        // keep the last known throne
      }
    }

    const poll = window.setInterval(refresh, 4000)
    return () => {
      cancelled = true
      window.clearInterval(poll)
    }
  }, [])

  async function claim(raw: string | null) {
    setBusy(true)
    setError(null)

    try {
      const response = await fetch("/api/throne", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(raw ? { name: raw } : {}),
      })
      const payload = (await response.json()) as Throne | { error?: string }

      if (!response.ok) {
        setError(
          "error" in payload && payload.error
            ? payload.error
            : "couldn't take it. try again.",
        )
        return
      }

      if ("name" in payload && "claimedAt" in payload) {
        setThrone(payload)
        setOpen(false)
        setName("")
      }
    } catch {
      setError("network blinked. try again.")
    } finally {
      setBusy(false)
    }
  }

  const occupied = Boolean(throne.name && throne.claimedAt)
  const displayName = occupied ? throne.name : "nobody"
  const status = occupied
    ? uptimeLabel(throne.claimedAt as number, now)
    : "empty throne"

  return (
    <div className="flex min-h-dvh flex-col bg-background px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <header className="flex items-center justify-between">
        <p className="text-sm tracking-wide text-muted-foreground lowercase">
          yeet
        </p>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <h1 className="max-w-[18ch] text-5xl font-medium tracking-tight break-words lowercase sm:text-7xl">
          {displayName}
        </h1>
        <p className="text-base text-muted-foreground lowercase tabular-nums sm:text-lg">
          {status}
        </p>
      </main>

      <footer className="mx-auto flex w-full max-w-sm flex-col items-center gap-5">
        <Button
          type="button"
          onClick={() => {
            setError(null)
            setOpen(true)
          }}
          className="h-20 w-full rounded-full text-2xl lowercase active:scale-[0.99]"
        >
          yeet
        </Button>
        <p className="text-xs text-muted-foreground lowercase">
          last click owns the page
        </p>
      </footer>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="lowercase">your name</DialogTitle>
            <DialogDescription className="lowercase">
              short. skip and we invent one.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void claim(name)
            }}
          >
            <Input
              autoFocus
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={24}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="leave blank if you want"
              className="h-12 rounded-xl text-base lowercase"
              disabled={busy}
            />
            {error ? (
              <p className="text-sm text-destructive lowercase">{error}</p>
            ) : null}
            <DialogFooter className="gap-3 border-0 bg-transparent p-0 sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="h-14 min-h-14 w-full flex-1 rounded-full px-5 py-4 text-lg lowercase"
                disabled={busy}
                onClick={() => void claim(null)}
              >
                skip
              </Button>
              <Button
                type="submit"
                className="h-14 min-h-14 w-full flex-1 rounded-full px-5 py-4 text-lg lowercase"
                disabled={busy}
              >
                {busy ? "yeeting" : "take it"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
