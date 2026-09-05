import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import StickyHeader from "@/components/others/StickyHeader";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://unilak-community.vercel.app'), // vercel production domain
  title: {
    default: "MY UNILAK",
    template: "%s | MY UNILAK"
  },
  description: "The community platform for UNILAK students to find classes, announcements, and engage in events.",
  keywords: ["UNILAK kigali", "UNILAK courses", " UNILAK E-Learning online quiz", "UNILAK E-Learning all courses", "UNILAK online services", "UNILAK courses", "kigali campus life", "events in kigali", "events near me"],
  openGraph: {
    title: "MY UNILAK",
    description: "The community platform for UNILAK students.",
    type: "website",
    locale: "en_US",
    siteName: "MY UNILAK",
  },
  twitter: {
    card: "summary_large_image",
    title: "MY UNILAK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="MY UNILAK" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/web-app-manifest-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icon0.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <StickyHeader />
        <main className="flex-grow flex flex-col w-full">
          {children}
        </main>
        <Analytics />
      </body>
    </html>
  );
}
