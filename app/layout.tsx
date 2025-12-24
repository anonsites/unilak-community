import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    default: "UNILAK COMMUNITY",
    template: "%s | UNILAK COMMUNITY"
  },
  description: "The community platform for UNILAK students to share reviews, announcements, and facts.",
  keywords: ["UNILAK", "Reviews", "E-Learning", "E-Learning all courses", "Announcements", "community", "campus life", "facts"],
  openGraph: {
    title: "UNILAK COMMUNITY",
    description: "The community platform for UNILAK students.",
    type: "website",
    locale: "en_US",
    siteName: "UNILAK COMMUNITY",
  },
  twitter: {
    card: "summary_large_image",
    title: "UNILAK COMMUNITY",
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
        <meta name="apple-mobile-web-app-title" content="UNILAK community" />
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
        <main className="flex-grow flex flex-col w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
