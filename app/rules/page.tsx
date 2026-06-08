import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Rules',
  description: 'Understand the rules and guidelines for participating in the UNILAK Community platform. Be respectful, honest, and protect your privacy.',
};

export default function RulesPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans">
      {/* MINIMIZED HEADER */}
      <header className="w-full bg-gray-900/80 border-b border-gray-800 py-4 px-4 md:px-8 flex flex-col items-center justify-center sticky top-0 z-40 backdrop-blur-md relative">
        <h1 className="text-xl font-bold tracking-wider text-white">COMMUNITY USAGE RULES</h1>
      </header>

      <div className="max-w-2xl mx-auto p-5 px-4 md:px-8 pb-12">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 pb-4 border-b border-white/10">
            <p className="text-white text-sm uppercase tracking-widest font-bold">
              Last updated: {currentYear}
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Rule 1 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500 select-none">01</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-blue-500 mb-2">Say it as it is</h3>
                <p className="text-white leading-relaxed">
                  Be honest and transparent. Share your genuine experiences without filtering the truth.
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500 select-none">02</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-blue-500 mb-2">Be respectful</h3>
                <p className="text-white leading-relaxed">
                  Treat others with dignity. Harassment, hate speech, or disrespect will not be tolerated.
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500 select-none">03</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-blue-500 mb-2">Use English language</h3>
                <p className="text-white leading-relaxed">
                  To ensure everyone understands, please communicate in English across the platform.
                </p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500 select-none">04</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-blue-500 mb-2">Protect your personal information</h3>
                <p className="text-white leading-relaxed">
                  Protect your privacy. Never share sensitive details like phone numbers or addresses publicly.
                </p>
              </div>
            </div>

            {/* Rule 5 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500 select-none">05</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-blue-500 mb-2">No irrelevant content</h3>
                <p className="text-white leading-relaxed">
                  Keep the community clean. Misleading information, scams, and spam are strictly prohibited.
                </p>
              </div>
            </div>

            {/* Rule 6 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500 select-none">06</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-blue-500 mb-2">Always remember rule N04</h3>
                <p className="text-white leading-relaxed">
                  We cannot emphasize this enough: Your personal safety and privacy come first.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
