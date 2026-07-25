'use client';

export default function AdvertSection() {
  return (
    <section className="w-full rounded-2xl border border-white/10 bg-[#2f2f2d] p-4 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
            Sponsored
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#1f1f1e] p-3">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-7034893758172685"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </section>
  );
}
