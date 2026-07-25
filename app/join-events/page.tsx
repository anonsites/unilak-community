import Image from 'next/image';
import AdvertToast from '@/components/AdvertToast';
import AdvertSection from '@/components/AdvertSection';

export default function JoinEventsPage() {
  return (
    <div className="min-h-screen bg-[#535350] text-white">
      <header className="w-full bg-gray-900/80 border-b border-gray-800 py-4 flex flex-col items-center justify-center sticky top-0 z-40 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-wider text-white">JOIN EVENTS</h1>
      </header>

      <div className="max-w-5xl mx-auto p-5">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center max-w-md">
            <Image
              src="/404-error.png"
              alt="No events found illustration"
              width={240}
              height={240}
              priority
              className="mx-auto"
            />
            <h3 className="text-xl font-semibold mb-2 mt-4">Hmmm... No events found.</h3>
            <p className="text-white/70">
              There are no upcoming events to show right now. Please check back later.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <AdvertSection />
        </div>
      </div>

      <AdvertToast />
    </div>
  );
}
