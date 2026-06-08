import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { ClassFilterOptions, UniversityClass } from '@/lib/types';

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

function uniqueSorted(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort((a, b) =>
    a.localeCompare(b)
  );
}

async function getClassOptions(supabase: Awaited<ReturnType<typeof createClient>>): Promise<ClassFilterOptions> {
  const { data, error } = await supabase
    .from('classes_table')
    .select('faculty, department, program, year_of_study, end_date')
    .gte('end_date', new Date().toISOString().split('T')[0])
    .limit(1000);

  const rows = (data || []) as Partial<UniversityClass>[];
  if (error) console.error('Error fetching class options:', error.message);

  return {
    faculties: uniqueSorted(rows.map((row) => row.faculty)),
    departments: uniqueSorted(rows.map((row) => row.department)),
    programs: uniqueSorted(rows.map((row) => row.program)),
    yearOfStudy: uniqueSorted(rows.map((row) => row.year_of_study)),
  };
}

async function isModerator(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles_table')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'moderator';
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const url = new URL(req.url);

  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 12, 1), 50);
  const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);
  const search = url.searchParams.get('search')?.trim();
  const faculty = url.searchParams.get('faculty')?.trim();
  const department = url.searchParams.get('department')?.trim();
  const program = url.searchParams.get('program')?.trim();
  const yearOfStudy = url.searchParams.get('year_of_study')?.trim();

  let query = supabase
    .from('classes_table')
    .select(CLASS_COLUMNS, { count: 'exact' })
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true, nullsFirst: false })
    .order('course_name', { ascending: true })
    .range(offset, offset + limit - 1);

  if (faculty) query = query.eq('faculty', faculty);
  if (department) query = query.eq('department', department);
  if (program) query = query.eq('program', program);
  if (yearOfStudy) query = query.eq('year_of_study', yearOfStudy);

  if (search) {
    const escapedSearch = search.replace(/[%_,]/g, '');
    query = query.or(
      [
        `course_name.ilike.%${escapedSearch}%`,
        `faculty.ilike.%${escapedSearch}%`,
        `department.ilike.%${escapedSearch}%`,
        `lecturer.ilike.%${escapedSearch}%`,
        `program.ilike.%${escapedSearch}%`,
        `intake.ilike.%${escapedSearch}%`,
      ].join(',')
    );
  }

  const [{ data, error, count }, options] = await Promise.all([query, getClassOptions(supabase)]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    classes: (data || []) as UniversityClass[],
    total: count || 0,
    limit,
    offset,
    options,
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  if (!(await isModerator(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await req.json();
  const requiredFields = ['course_name', 'faculty', 'department', 'year_of_study', 'program', 'intake'];

  for (const field of requiredFields) {
    if (!payload[field]?.trim()) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const { data, error } = await supabase
    .from('classes_table')
    .insert({
      course_name: payload.course_name.trim(),
      faculty: payload.faculty.trim(),
      department: payload.department.trim(),
      year_of_study: payload.year_of_study.trim(),
      program: payload.program.trim(),
      intake: payload.intake.trim(),
      lecturer: payload.lecturer?.trim() || null,
      start_date: payload.start_date || null,
      end_date: payload.end_date || null,
      cat_date: payload.cat_date || null,
      exam_date: payload.exam_date || null,
      classroom: payload.classroom?.trim() || null,
      whatsapp_link: payload.whatsapp_link?.trim() || null,
      cp_contact: payload.cp_contact?.trim() || null,
    })
    .select(CLASS_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
