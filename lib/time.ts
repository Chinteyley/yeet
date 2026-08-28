export function formatUptime(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000))

  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    const rem = seconds % 60
    return rem ? `${minutes}m ${rem}s` : `${minutes}m`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const rem = minutes % 60
    return rem ? `${hours}h ${rem}m` : `${hours}h`
  }

  const days = Math.floor(hours / 24)
  const remHours = hours % 24
  return remHours ? `${days}d ${remHours}h` : `${days}d`
}

export function uptimeLabel(claimedAt: number, now = Date.now()): string {
  const duration = formatUptime(now - claimedAt)
  if (duration === "just now") return "just now"
  return `up for ${duration}`
}
