import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { getThrone } from "@/lib/throne"
import { siteUrl } from "@/lib/site"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const dynamic = "force-dynamic"

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  viewportFit: "cover",
}

export async function generateMetadata(): Promise<Metadata> {
  const throne = await getThrone()
  const name = throne?.name ?? "nobody"
  const title = "yeet"
  const description = throne
    ? `${name} owns this page`
    : "last click owns the page"

  return {
    metadataBase: new URL(siteUrl()),
    title,
    description,
    applicationName: "yeet",
    robots: { index: true, follow: true },
    openGraph: {
      title: throne ? `${name} is up` : "empty throne",
      description: "last click owns the page",
      siteName: "yeet",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: throne ? `${name} is up` : "empty throne",
      description: "last click owns the page",
    },
  }
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground lowercase">
        {children}
      </body>
    </html>
  )
}
