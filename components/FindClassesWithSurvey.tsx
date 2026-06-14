'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SurveyForm from './SurveyForm';

export default function FindClassesWithSurvey() {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const router = useRouter();

  // Both actions (Cancel and Submit) will trigger navigation to the classes page
  const handleNavigation = (skipSurvey = false) => {
    setIsSurveyOpen(false);
    if (!skipSurvey) {
      sessionStorage.setItem('surveyShownForSession', 'true');
    }
    router.push('/find-classes');
  };

  const handleOpenSurveyClick = () => {
    sessionStorage.getItem('surveyShownForSession') ? handleNavigation(true) : setIsSurveyOpen(true);
  }

  return (
    <>
      <button
        onClick={handleOpenSurveyClick}
        className="group relative flex h-40 w-full flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[#346596] p-5 shadow-lg shadow-black/20 transition hover:-translate-y-1 hover:border-white/20 hover:bg-[#25282c] text-left"
      > {/* Changed onClick to handleOpenSurveyClick */}
        {/* Half-moon image container on top left - matched visually from HomeCard */}
        <div className="absolute -left-4 -top-4 flex h-28 w-28 items-center justify-center rounded-br-full bg-white pr-4 pb-4 transition-transform duration-300 group-hover:scale-110">
          <div className="relative h-14 w-14">
            <Image 
              src="/images/findclass.png" 
              alt="Find Classes" 
              fill 
              className="object-contain"
            />
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="text-lg font-bold tracking-tight text-white">Find Classes</h2>
        </div>
      </button>

      {isSurveyOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-[#202623] rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <SurveyForm 
              onClose={handleNavigation} 
              onSuccess={handleNavigation} 
            />
          </div>
        </div>
      )}
    </>
  );
}