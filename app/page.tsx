import { ThroneBoard } from "@/components/throne-board"
import { getThrone } from "@/lib/throne"

export const dynamic = "force-dynamic"

export default async function Home() {
  const throne = await getThrone()

  return (
    <ThroneBoard
      initial={{
        name: throne?.name ?? null,
        claimedAt: throne?.claimedAt ?? null,
        longest: throne?.longest ?? null,
      }}
    />
  )
}
