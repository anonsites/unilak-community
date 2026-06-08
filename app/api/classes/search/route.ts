import { NextResponse } from 'next/server';
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

function relevanceFor(classItem: UniversityClass, query: string) {
  const needle = query.toLowerCase();
  let score = 0;

  if (classItem.course_name.toLowerCase().includes(needle)) score += 4;
  if (classItem.department.toLowerCase().includes(needle)) score += 3;
  if (classItem.program.toLowerCase().includes(needle)) score += 2;
  if (classItem.lecturer?.toLowerCase().includes(needle)) score += 2;

  return score;
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const body = await req.json();
  const search = String(body.search || body.query || '').trim();
  const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 50);

  if (search.length < 2) {
    return NextResponse.json({ error: 'Search must be at least 2 characters' }, { status: 400 });
  }

  const safeSearch = search.replace(/[%_,]/g, '');
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('classes_table')
    .select(CLASS_COLUMNS)
    .gte('end_date', today)
    .or(
      [
        `course_name.ilike.%${safeSearch}%`,
        `department.ilike.%${safeSearch}%`,
        `lecturer.ilike.%${safeSearch}%`,
        `program.ilike.%${safeSearch}%`,
        `intake.ilike.%${safeSearch}%`,
      ].join(',')
    )
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = ((data || []) as UniversityClass[])
    .map((classItem) => ({
      ...classItem,
      relevance: relevanceFor(classItem, search),
    }))
    .sort((a, b) => b.relevance - a.relevance || a.course_name.localeCompare(b.course_name));

  return NextResponse.json({ results });
}
