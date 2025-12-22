import React from 'react';

export default function AuthHelp() {
  return (
    <div className="h-full flex flex-col justify-between p-8 md:p-12">
      <div>
        <div className="flex items-center gap-3 mb-8 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
          <h2 className="text-xl font-bold tracking-wide uppercase">Help</h2>
        </div>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-blue-400 font-bold text-sm">1</div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Use your email address not REG number</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Your email is private, only you can see it</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-blue-400 font-bold text-sm">2</div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Set a password</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Your password should be strong</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-blue-400 font-bold text-sm">3</div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Be you</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Tell us who you are at UNILAK</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-blue-400 font-bold text-sm">4</div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">Don&apos;t worry</h3>
              <p className="text-xs text-gray-400 leading-relaxed">We will set an anonymous username for you</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-700/50">
        <p className="text-[10px] font-bold text-gray-300 mb-2 uppercase tracking-wider">Disclaimer</p>
        <p className="text-[10px] font-bold leading-relaxed text-gray-400">
          This community is not run, affiliated, managed or owned by UNILAK (University of Lay Adventist of Kigali). Please double check information or reach their official site.
        </p>
      </div>
    </div>
  );
}