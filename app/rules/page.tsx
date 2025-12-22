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
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-gray-600 via-blue-500 to-gray-400 py-12 shadow-xl mb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wider text-white drop-shadow-md">COMMUNITY USAGE RULES</h1>
          <Link href="/" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Back to Home">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-8 pb-12">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 pb-4 border-b border-white/10">
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">
              Last updated: {currentYear}
            </p>
          </div>
          
          <div className="space-y-8">
            {/* Rule 1 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500/20 select-none">01</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-white mb-2">Say it as it is</h3>
                <p className="text-gray-400 leading-relaxed">
                  Be honest and transparent. Share your genuine experiences without filtering the truth.
                </p>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500/20 select-none">02</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-white mb-2">Be respectful</h3>
                <p className="text-gray-400 leading-relaxed">
                  Treat others with dignity. Harassment, hate speech, or disrespect will not be tolerated.
                </p>
              </div>
            </div>

            {/* Rule 3 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500/20 select-none">03</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-white mb-2">Use English language</h3>
                <p className="text-gray-400 leading-relaxed">
                  To ensure everyone understands, please communicate in English across the platform.
                </p>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500/20 select-none">04</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-white mb-2">Don&apos;t expose your personal information</h3>
                <p className="text-gray-400 leading-relaxed">
                  Protect your privacy. Never share sensitive details like phone numbers or addresses publicly.
                </p>
              </div>
            </div>

            {/* Rule 5 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500/20 select-none">05</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-white mb-2">No fake/fraud/scam/spam content</h3>
                <p className="text-gray-400 leading-relaxed">
                  Keep the community clean. Misleading information, scams, and spam are strictly prohibited.
                </p>
              </div>
            </div>

            {/* Rule 6 */}
            <div className="flex gap-5">
              <span className="text-3xl font-black text-blue-500/20 select-none">06</span>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-white mb-2">Always remember rule N04</h3>
                <p className="text-gray-400 leading-relaxed">
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
