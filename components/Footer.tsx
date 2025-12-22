import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#1a1a1a] text-white py-12 border-t border-white/10">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start gap-10">
        
        {/* Left Side: Branding */}
        <div className="flex flex-col space-y-4 max-w-sm">
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            UNILAK COMMUNITY
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering students with a voice. Share your experiences, stay informed, and connect with the campus community.
          </p>
          <div className="pt-4">
             <p className="text-gray-600 text-xs" suppressHydrationWarning>
               &copy; {new Date().getFullYear()} Unilak Community.
             </p>
          </div>
        </div>

        {/* Right Side: Quick Links */}
        <div className="w-full md:w-96">
          <h3 className="text-2xl font-bold mb-6 text-white tracking-wide">
            Quick links:
          </h3>
          
          <div className="flex flex-col bg-[#222] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            
            {/* Link 1: MY ACCOUNT */}
            <Link href="/account" className="group flex items-center gap-5 p-5 hover:bg-[#2a2a2a] transition-all duration-300 border-b border-white/5">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">MY ACCOUNT</span>
            </Link>

            {/* Link 2: MAKE ANNOUNCEMENT */}
            <Link href="/announcement" className="group flex items-center gap-5 p-5 hover:bg-[#2a2a2a] transition-all duration-300 border-b border-white/5">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">MAKE ANNOUNCEMENT</span>
            </Link>

            {/* Link 3: FEEDBACK */}
            <Link href="/feedback" className="group flex items-center gap-5 p-5 hover:bg-[#2a2a2a] transition-all duration-300 border-b border-white/5">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">FEEDBACK</span>
            </Link>

            {/* Link 4: COMMUNITY USAGE RULES */}
            <Link href="/rules" className="group flex items-center gap-5 p-5 hover:bg-[#2a2a2a] transition-all duration-300 border-b border-white/5">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">COMMUNITY USAGE RULES</span>
            </Link>

            {/* Link 6: PRIVACY POLICY */}
            <Link href="/privacy" className="group flex items-center gap-5 p-5 hover:bg-[#2a2a2a] transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center group-hover:bg-gray-500 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors">PRIVACY POLICY</span>
            </Link>

          </div>
        </div>
      </div>
    </footer>
  );
}