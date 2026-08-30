import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ogImageUrl, siteUrl } from "@/lib/site"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const origin = siteUrl()
const image = ogImageUrl()

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  viewportFit: "cover",
}

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: "yeet",
  description: "last click owns the page",
  applicationName: "yeet",
  robots: { index: true, follow: true },
  openGraph: {
    title: "yeet",
    description: "last click owns the page",
    url: origin,
    siteName: "yeet",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: image,
        secureUrl: image,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "yeet. last click owns the page.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "yeet",
    description: "last click owns the page",
    images: [image],
  },
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
