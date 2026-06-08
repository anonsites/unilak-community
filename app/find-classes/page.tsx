import { Metadata } from 'next';
import FindClassesClient from './FindClassesClient';

export const metadata: Metadata = {
  title: 'Find Campus Courses',
  description: 'Discover campus course listings by department, program, academic year, intake, lecturer, classroom, and important dates.',
};

export default function FindClassesPage() {
  return (
    <div className="min-h-screen bg-[#535350] text-white">
      {/* MINIMIZED HEADER */}
      <header className="w-full bg-gray-900/80 border-b border-gray-800 py-4 px-4 md:px-8 flex flex-col items-center justify-center sticky top-0 z-40 backdrop-blur-md relative">
        <h1 className="text-xl font-bold tracking-wider text-white">FIND A CLASS</h1>
      </header>
      <FindClassesClient />
    </div>
  );
}
