'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StickyHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-gradient-to-r from-gray-600 via-blue-500 to-gray-400 shadow-lg shadow-black/20 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="MY UNILAK home">
          <Image
            src="/community-icon.png"
            alt="MY UNILAK"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10"
            priority
          />
          <span className="text-sm font-extrabold uppercase tracking-wide text-white sm:text-base">
            MY UNILAK
          </span>
        </Link>

        {!isHome && (
          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-[0_4px_15px_rgba(0,0,0,0.3)] ring-4 ring-white/10 active:scale-90 transition-transform"
            aria-label="Go to home page"
            title="Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M11.47 3.84a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.06l-.91-.91V19.5A2.25 2.25 0 0 1 17 21.75H7A2.25 2.25 0 0 1 4.75 19.5v-6.82l-.91.91a.75.75 0 0 1-1.06-1.06l8.69-8.69ZM12 5.43l-5.75 5.75v8.32c0 .41.34.75.75.75h2.25V15a2.25 2.25 0 0 1 2.25-2.25h1A2.25 2.25 0 0 1 14.75 15v5.25H17a.75.75 0 0 0 .75-.75v-8.32L12 5.43Z" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}
