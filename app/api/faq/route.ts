import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

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
    const url = new URL(req.url);

    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('faq_table')
      .select('id, question, answer, category, view_count, keywords')
      .eq('is_published', true)
      .order('order', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply search filter (searches in question and keywords)
    if (search) {
      const escapedSearch = search.replace(/[%_,]/g, '');
      query = query.or(
        `question.ilike.%${escapedSearch}%,answer.ilike.%${escapedSearch}%`
      );
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching FAQs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch FAQs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count,
      total: count,
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/faq:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Check if moderator
    if (!(await isModerator(supabase))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { question, answer, category, keywords, order, is_published } = body;

    // Validate required fields
    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: question, answer, category' },
        { status: 400 }
      );
    }

    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Insert FAQ
    const { data, error } = await supabase
      .from('faq_table')
      .insert([
        {
          question,
          answer,
          category,
          keywords: keywords && keywords.length > 0 ? keywords : null,
          order: order || 0,
          is_published: is_published !== undefined ? is_published : true,
          created_by: user.id,
        },
      ])
      .select();

    if (error) {
      console.error('Error creating FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to create FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data?.[0],
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/faq:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
