import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Work_Sans, Open_Sans } from "next/font/google"
import "./globals.css"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
  weight: ["400", "600", "700"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "TradingSignals Pro - Real-Time Trading Platform",
  description:
    "Professional real-time trading signals platform with advanced analytics, community features, and strategy backtesting",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${openSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-heading: ${workSans.variable};
}
        `}</style>
      </head>
      <body
        className={`${workSans.variable} ${openSans.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <div className="min-h-screen bg-background text-foreground">{children}</div>
      </body>
    </html>
  )
}
