import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DonationCard from '@/components/DonationCard';
import ShareClassButtons from '@/components/ShareClassButtons';
import { createClient } from '@/lib/supabaseServer';
import { UniversityClass } from '@/lib/types';

const CLASS_COLUMNS = `
  id,
  course_name,
  faculty,
  department,
  year_of_study,
  program,
  intake,
  lecturer,
  start_date,
  end_date,
  cat_date,
  exam_date,
  classroom,
  whatsapp_link,
  cp_contact,
  created_at,
  updated_at
`;

function formatDate(value: string | null) {
  if (!value) return 'Not set';

  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

async function getClass(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('classes_table')
    .select(CLASS_COLUMNS)
    .eq('id', id)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .single();

  if (error || !data) return null;

  return data as UniversityClass;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const classItem = await getClass(id);

  if (!classItem) {
    return { title: 'Class not found' };
  }

  return {
    title: classItem.course_name,
    description: `${classItem.course_name} class details for ${classItem.program}, ${classItem.intake}.`,
  };
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const classItem = await getClass(id);

  if (!classItem) {
    notFound();
  }

  const importantDates = [
    { label: 'Start date', value: classItem.start_date },
    { label: 'End date', value: classItem.end_date },
    { label: 'CAT date', value: classItem.cat_date },
    { label: 'Exam date', value: classItem.exam_date },
  ];

  return (
    <div className="min-h-screen bg-[#535350] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/find-classes"
          className="inline-flex rounded-lg border border-white/10 px-4 py-2 text-lg font-bold text-gray-200 transition bg-blue-600 hover:bg-blue-500"
        >
          Back to courses
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex flex-col gap-6">
            {/* Course Information Card */}
            <section className="rounded-lg border border-white/10 bg-gray-900 p-6 shadow-lg">
              <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl mb-8">
                {classItem.course_name}
              </h1>

              <h2 className="text-xl font-extrabold text-white mb-6">More Info</h2>
              <div className="space-y-4 border-l border-white/10 pl-6">
                <p className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.902a48.627 48.627 0 0 1 8.232-4.408 60.462 60.462 0 0 0-.491-6.347m-15.482 0A50.585 50.585 0 0 0 12 13.447a50.585 50.585 0 0 0 7.74-3.303m-15.48 0a50.652 50.652 0 0 1 7.74-3.303m-7.74 3.303 7.74-3.303m0 0-.52-1.04a1.5 1.5 0 0 0-1.417-.923H4.26a1.5 1.5 0 0 0-1.417.923l-.52 1.04m15.482 0a50.653 50.653 0 0 0 7.74-3.303m-7.74 3.303.52-1.04a1.5 1.5 0 0 0 1.417-.923h7.164a1.5 1.5 0 0 0 1.417.923l.52 1.04M12 13.447l-7.74 3.303m7.74-3.303 7.74 3.303m0 0 1.04 2.08a1.5 1.5 0 0 0 1.415.923h7.164a1.5 1.5 0 0 0 1.417-.923l.52-1.04M12 13.447l-7.74 3.303m7.74-3.303 7.74 3.303m0 0-.52-1.04a1.5 1.5 0 0 0-1.417-.923H4.26a1.5 1.5 0 0 0-1.417.923l-.52 1.04" />
                  </svg>
                  <span className="text-white font-bold">Program:</span> <span className="text-cyan-200 font-semibold ml-2">{classItem.program}</span>
                </p>
                <p className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5m-16.5 0a2.25 2.25 0 0 0 2.25-2.25H17.25A2.25 2.25 0 0 0 19.5 18.75m-16.5 0V8.25M19.5 18.75V8.25m-16.5 0a2.25 2.25 0 0 1 2.25-2.25h10.5a2.25 2.25 0 0 1 2.25 2.25m-16.5 0H5.25C3.906 6.75 3 5.656 3 4.312V3.75c0-1.036.84-1.875 1.875-1.875h16.5c1.036 0 1.875.84 1.875 1.875v.562c0 1.344-.906 2.437-2.25 2.437H19.5M12 4.5V18" />
                  </svg>
                  <span className="text-white font-bold">Faculty:</span> <span className="text-cyan-200 font-semibold ml-2">{classItem.faculty}</span>
                </p>
                <p className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5m-9 3.75h6.75M13.5 21h3.75m-3.75 0L15 18.75V10.5m-15 0h15" />
                  </svg>
                  <span className="text-white font-bold">Department:</span> <span className="text-cyan-200 font-semibold ml-2">{classItem.department}</span>
                </p>
                <p className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h.008v.008H3v-.008Zm0 0H5.25" />
                  </svg>
                  <span className="text-white font-bold">Intake:</span> <span className="text-cyan-200 font-semibold ml-2">{classItem.intake}</span>
                </p>
                <p className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.902a48.627 48.627 0 0 1 8.232-4.408 60.462 60.462 0 0 0-.491-6.347m-15.482 0A50.585 50.585 0 0 0 12 13.447a50.585 50.585 0 0 0 7.74-3.303m-15.48 0a50.652 50.652 0 0 1 7.74-3.303m-7.74 3.303 7.74-3.303m0 0-.52-1.04a1.5 1.5 0 0 0-1.417-.923H4.26a1.5 1.5 0 0 0-1.417.923l-.52 1.04m15.482 0a50.653 50.653 0 0 0 7.74-3.303m-7.74 3.303.52-1.04a1.5 1.5 0 0 0 1.417-.923h7.164a1.5 1.5 0 0 0 1.417.923l.52 1.04M12 13.447l-7.74 3.303m7.74-3.303 7.74 3.303m0 0 1.04 2.08a1.5 1.5 0 0 0 1.415.923h7.164a1.5 1.5 0 0 0 1.417-.923l.52-1.04M12 13.447l-7.74 3.303m7.74-3.303 7.74 3.303m0 0-.52-1.04a1.5 1.5 0 0 0-1.417-.923H4.26a1.5 1.5 0 0 0-1.417.923l-.52 1.04" />
                  </svg>
                  <span className="text-white font-bold">Year of study:</span> <span className="text-cyan-200 font-semibold ml-2">Year {classItem.year_of_study}</span>
                </p>
                <p className="text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  <span className="text-white font-bold">Lecturer:</span> <span className="text-cyan-200 font-semibold ml-2">{classItem.lecturer || 'Not announced'}</span>
                </p>
              </div>
            </section>

            {/* Important Dates Card */}
            <section className="rounded-lg border border-white/10 bg-gray-900 p-6 shadow-lg">
              <h2 className="text-xl font-extrabold text-white mb-4">Important dates</h2>
              <div className="space-y-3 border-l border-white/10 pl-6">
                {importantDates.map((date, index) => {
                  const getIcon = () => {
                    switch (index) {
                      case 0:
                        return (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h.008v.008H3v-.008Zm0 0H5.25" />
                          </svg>
                        );
                      case 1:
                        return (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h.008v.008H3v-.008Zm0 0H5.25" />
                          </svg>
                        );
                      case 2:
                        return (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                        );
                      case 3:
                        return (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-cyan-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75h-1.5m-6 0v6m0-6v6m0-6h6m-6 0H9" />
                          </svg>
                        );
                      default:
                        return null;
                    }
                  };

                  return (
                    <p key={date.label} className="text-base flex items-center">
                      {getIcon()}
                      <span className="text-white font-bold">{date.label}:</span>
                      <span className="text-cyan-200 font-semibold ml-2">{formatDate(date.value)}</span>
                    </p>
                  );
                })}
              </div>
            </section>
            {/* Class Contacts Card */}
            <section className="rounded-lg border border-white/10 bg-gray-900 p-6 shadow-lg">
              <h2 className="text-xl font-extrabold text-white">Class contacts</h2>
              <div className="mt-4 space-y-3 border-l border-white/10 pl-6">
                <p className="text-base">
                  <span className="text-white font-bold">Classroom:</span> 
                  <span className="text-cyan-200 font-semibold ml-2">{classItem.classroom || 'Not announced'}</span>
                </p>
                <p className="text-base">
                  <span className="text-white font-bold">CP contact:</span> 
                  {classItem.cp_contact ? (
                    <a 
                      href={`tel:${classItem.cp_contact}`} 
                      className="ml-2 inline-block text-cyan-200 font-semibold transition hover:text-white underline decoration-cyan-200/30 underline-offset-4"
                    >
                      {classItem.cp_contact}
                    </a>
                  ) : (
                    <span className="ml-2 text-cyan-200 font-semibold">Not announced</span>
                  )}
                </p>
              </div>

              {classItem.whatsapp_link && (
                <a
                  href={classItem.whatsapp_link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-lg font-extrabold text-slate-950 transition hover:bg-emerald-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zM12.05 20.21c-1.5 0-2.97-.39-4.27-1.14l-.3-.18-3.15.83.84-3.07-.19-.31a8.154 8.154 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.24-8.22 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.23.24-.39.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.11-.23-.16-.48-.28z" />
                  </svg>
                  WhatsApp group
                </a>
              )}
            </section>

            <ShareClassButtons classId={classItem.id} courseName={classItem.course_name} />
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start pt-6 lg:pt-0">
            <DonationCard />
          </div>
        </div>
      </div>
    </div>
  );
}
