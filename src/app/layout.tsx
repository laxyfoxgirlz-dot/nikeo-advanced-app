import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NIKEO Advanced - Short Video Platform",
  description: "Create, share, and discover short videos on NIKEO Advanced - the next-generation short video platform.",
  keywords: ["NIKEO", "short videos", "social media", "video sharing", "TikTok alternative"],
  authors: [{ name: "NIKEO Team" }],
  openGraph: {
    title: "NIKEO Advanced",
    description: "Create, share, and discover short videos on NIKEO Advanced",
    url: "https://nikeo.app",
    siteName: "NIKEO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIKEO Advanced",
    description: "Create, share, and discover short videos",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
