'use client';

import { useState } from 'react';
import SurveyForm from './SurveyForm'; // Assuming SurveyForm is in the same components directory

export default function PremiumCallToActionCard() {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const handleOpenSurvey = () => {
    setIsSurveyOpen(true);
  };

  const handleCloseSurvey = () => {
    setIsSurveyOpen(false);
  };

  const handleSurveySuccess = () => {
    setIsSurveyOpen(false);
    // Optionally show a success message or redirect
    alert('Thank you for contributing!');
  };

  return (
    <>
      <button
        onClick={handleOpenSurvey}
        className="relative flex items-center justify-center p-8 rounded-xl overflow-hidden cursor-pointer group
                   bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800
                   transition-all duration-300 ease-in-out transform hover:scale-[1.01] shadow-lg hover:shadow-xl"
      >
        <div className="absolute inset-0 bg-pattern-grid opacity-10 group-hover:opacity-15 transition-opacity duration-300"></div>
        <h2 className="relative z-10 text-center text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
          Contribute to our mission
        </h2>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </button>

      {isSurveyOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-[#202623] rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseSurvey}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-20"
              aria-label="Close survey"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SurveyForm onClose={handleCloseSurvey} onSuccess={handleSurveySuccess} />
          </div>
        </div>
      )}
    </>
  );
}