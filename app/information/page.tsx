'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FAQSearch from '@/components/FAQSearch';
import FAQItem from '@/components/FAQItem';
import DonationModal from '@/components/DonationModal';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  view_count: number;
}

export default function InformationPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/faq?limit=100');
  
        if (!response.ok) {
          console.error('Failed to fetch FAQs');
          setFaqs([]);
          return;
        }

        const result = await response.json();
        setFaqs((result.data || []).sort((a: FAQ, b: FAQ) => b.view_count - a.view_count)); // Sort by view_count descending
        setFilteredFaqs(result.data || []);
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const handleSearch = (query: string, category: string) => {
    let filtered = faqs;

    // Filter by category
    if (category) {
      filtered = filtered.filter(faq => faq.category === category);
    }

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(lowerQuery) ||
          faq.answer.toLowerCase().includes(lowerQuery)
      );
    }

    setSearchQuery(query);
    setFilteredFaqs(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredFaqs.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedFaqs = filteredFaqs.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="min-h-screen bg-[#535350] text-white">
      {/* MINIMIZED HEADER*/}
      <header className="w-full bg-gray-900/80 border-b border-gray-800 py-4 flex flex-col items-center justify-center sticky top-0 z-40 backdrop-blur-md">
        <h1 className="text-xl font-bold tracking-wider text-white">QUESTIONS & ANSWERS</h1>
      </header>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto p-5">
        {/* Search and Filters */}
        <div className="mb-8">
          <FAQSearch onSearch={handleSearch} isLoading={loading} />
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <>
            <div className="text-center py-16">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-16 h-16 mx-auto text-white mb-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.9.776-2.35.776-3.612 0M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">No FAQs found</h3>
              <p className="text-gwhite/70 mb-6">No questions and Answers found.</p>
            </div>

            {/* Help Section for no results */}
            <div className="mt-16 pt-8 border-t border-gray-700">
              <div className="bg-linear-to-br from-[#655c5c] to-[#38707a] rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold mb-3">Can&apos;t find your answer?</h3>
                <p className="text-white mb-6 max-w-2xl mx-auto">
                  If you couldn&apos;t find the information you&apos;re looking for, Send us a feedback
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/feedback"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                  >
                    Send us Feedback
                  </Link>
                  <Link
                    href={`https://wa.me/250795581173?text=I+need+help+with:+${encodeURIComponent(searchQuery || ' ')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.5 0-2.97-.39-4.27-1.14l-.3-.18-3.15.83.84-3.07-.19-.31a8.154 8.154 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.22 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.23.24-.39.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.11-.23-.16-.48-.28z"/>
                    </svg>
                    Ask via WhatsApp
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : ( /* Results found */
          <>
            <div className="space-y-4">
              {paginatedFaqs.map(faq => (
                <FAQItem
                  key={faq.id}
                  id={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                  category={faq.category}
                  viewCount={faq.view_count}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Previous
                </button>

                <div className="flex gap-1 items-center">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {/* Donation/Support Section for when results are found */}
        {!loading && filteredFaqs.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-700">
            <div className="bg-linear-to-br from-[#655c5c] to-[#38707a] rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">Have you found what you were looking for?</h3>
              <p className="text-white mb-6 max-w-2xl mx-auto">
                Consider supporting us to keep this platform running and improving.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setShowDonationModal(true)}
                  className="px-6 py-2.5 bg-blue-400 hover:bg-blue-300 rounded-lg font-medium transition-colors"
                >
                  Yes! Donate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
      />
    </div>
  );
}
