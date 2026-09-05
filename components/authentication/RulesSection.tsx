export default function RulesSection() {
  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl h-fit sticky top-8">
      <div className="mb-6 pb-3 border-b border-white/10">
        <h2 className="text-xl font-bold text-white">Community Rules</h2>
      </div>
      
      <div className="space-y-6">
        {/* Rule 1 */}
        <div className="flex gap-4">
          <span className="text-2xl font-black text-blue-500/20 select-none">01</span>
          <div className="pt-0.5">
            <h3 className="text-lg font-bold text-white mb-1">Say it as it is</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Be honest and transparent. Share your genuine experiences without filtering the truth.
            </p>
          </div>
        </div>

        {/* Rule 2 */}
        <div className="flex gap-4">
          <span className="text-2xl font-black text-blue-500/20 select-none">02</span>
          <div className="pt-0.5">
            <h3 className="text-lg font-bold text-white mb-1">Be respectful</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Treat others with dignity. Harassment, hate speech, or disrespect will not be tolerated.
            </p>
          </div>
        </div>

        {/* Rule 3 */}
        <div className="flex gap-4">
          <span className="text-2xl font-black text-blue-500/20 select-none">03</span>
          <div className="pt-0.5">
            <h3 className="text-lg font-bold text-white mb-1">Use English language</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              To ensure everyone understands, please communicate in English across the platform.
            </p>
          </div>
        </div>

        {/* Rule 4 */}
        <div className="flex gap-4">
          <span className="text-2xl font-black text-blue-500/20 select-none">04</span>
          <div className="pt-0.5">
            <h3 className="text-lg font-bold text-white mb-1">Don&apos;t expose your personal information</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Protect your privacy. Never share sensitive details like phone numbers or addresses publicly.
            </p>
          </div>
        </div>

        {/* Rule 5 */}
        <div className="flex gap-4">
          <span className="text-2xl font-black text-blue-500/20 select-none">05</span>
          <div className="pt-0.5">
            <h3 className="text-lg font-bold text-white mb-1">No fake/fraud/scam/spam content</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Keep the community clean. Misleading information, scams, and spam are strictly prohibited.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}