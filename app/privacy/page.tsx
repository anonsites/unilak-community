'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#535350] text-white font-sans">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-gray-600 via-blue-500 to-gray-400 py-12 shadow-xl mb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wider text-white drop-shadow-md">PRIVACY POLICY</h1>
          <Link href="/" className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" title="Back to Home">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 pb-12">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 pb-4 border-b border-white/10">
            <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">
              Last updated: {currentYear}
            </p>
          </div>
          
          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
              <p>
                Welcome to UNILAK Community. We respect your privacy and are committed to protecting your personal data. 
                This privacy policy will inform you as to how we look after your personal data when you visit our website 
                and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
              <p className="mb-2">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Identity Data:</strong> includes username or similar identifier, and role at the university.</li>
                <li><strong>Contact Data:</strong> includes email address.</li>
                <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, and operating system.</li>
                <li><strong>Usage Data:</strong> includes information about how you use our website, such as reviews posted and interactions.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. How We Use Your Information</h2>
              <p>
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>To register you as a new user.</li>
                <li>To manage our relationship with you.</li>
                <li>To enable you to partake in our community features (reviews, announcements).</li>
                <li>To administer and protect our business and this website.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. 
                In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Your Rights</h2>
              <p>
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data and (where the lawful ground of processing is consent) to withdraw consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">6. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us through the announcement or takedown request forms available on the platform.
              </p>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}