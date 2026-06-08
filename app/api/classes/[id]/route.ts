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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from('classes_table')
    .select(CLASS_COLUMNS)
    .eq('id', id)
    .gte('end_date', new Date().toISOString().split('T')[0])
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  if (!(await isModerator(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const payload = await req.json();

  const allowedFields = [
    'course_name',
    'faculty',
    'department',
    'year_of_study',
    'program',
    'intake',
    'lecturer',
    'start_date',
    'end_date',
    'cat_date',
    'exam_date',
    'classroom',
    'whatsapp_link',
    'cp_contact',
  ];

  const updatePayload = Object.fromEntries(
    allowedFields
      .filter((field) => Object.prototype.hasOwnProperty.call(payload, field))
      .map((field) => [field, typeof payload[field] === 'string' ? payload[field].trim() || null : payload[field]])
  );

  const { data, error } = await supabase
    .from('classes_table')
    .update(updatePayload)
    .eq('id', id)
    .select(CLASS_COLUMNS)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();

  if (!(await isModerator(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { error } = await supabase
    .from('classes_table')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
