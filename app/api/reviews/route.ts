import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    topic_id,
    subtopic_id,
    type,
    content,
    recommendation
  } = await req.json();

  // 1. Auth check
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 2. Basic validation
  if (!topic_id || !subtopic_id || !type || !content?.trim()) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  if (!['positive', 'negative'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid review type' },
      { status: 400 }
    );
  }

  // 3. Insert review
  const { data, error } = await supabase
    .from('reviews_table')
    .insert({
      user_id: user.id,
      topic_id,
      subtopic_id,
      type,
      content: content.trim(),
      recommendation: recommendation?.trim() || null
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, { status: 201 });
}
