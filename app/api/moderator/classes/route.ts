import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

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

async function isModerator(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles_table')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'moderator';
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Check if moderator
    if (!(await isModerator(supabase))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const sort = url.searchParams.get('sort') || 'updated';
    const department = url.searchParams.get('department') || '';
    const program = url.searchParams.get('program') || '';
    const search = url.searchParams.get('search') || '';

    // Build query for ALL classes (no date filtering)
    let query = supabase
      .from('classes_table')
      .select(CLASS_COLUMNS);

    // Apply filters
    if (department) {
      query = query.eq('department', department);
    }

    if (program) {
      query = query.eq('program', program);
    }

    // Apply search
    if (search) {
      const escapedSearch = search.replace(/[%_,]/g, '');
      query = query.or(
        `course_name.ilike.%${escapedSearch}%,lecturer.ilike.%${escapedSearch}%`
      );
    }

    // Apply sorting
    if (sort === 'course') {
      query = query.order('course_name', { ascending: true });
    } else if (sort === 'department') {
      query = query.order('department', { ascending: true });
    } else {
      query = query.order('updated_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching classes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch classes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('Error in GET /api/moderator/classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
