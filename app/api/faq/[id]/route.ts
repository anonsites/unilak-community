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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: faqId } = await params;

    // Get the FAQ
    const { data, error } = await supabase
      .from('faq_table')
      .select('*')
      .eq('id', faqId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    // Check if user is moderator or if FAQ is published
    const isMod = await isModerator(supabase);
    if (!data.is_published && !isMod) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error in GET /api/faq/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check if moderator
    if (!(await isModerator(supabase))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: faqId } = await params;
    const body = await req.json();
    const { question, answer, category, keywords, order, is_published } = body;

    // Validate required fields
    if (!question || !answer || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: question, answer, category' },
        { status: 400 }
      );
    }

    // Update FAQ
    const { data, error } = await supabase
      .from('faq_table')
      .update({
        question,
        answer,
        category,
        keywords: keywords && keywords.length > 0 ? keywords : null,
        order: order !== undefined ? order : 0,
        is_published: is_published !== undefined ? is_published : true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', faqId)
      .select();

    if (error) {
      console.error('Error updating FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to update FAQ' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error('Error in PUT /api/faq/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check if moderator
    if (!(await isModerator(supabase))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: faqId } = await params;

    // Delete FAQ
    const { error } = await supabase
      .from('faq_table')
      .delete()
      .eq('id', faqId);

    if (error) {
      console.error('Error deleting FAQ:', error);
      return NextResponse.json(
        { error: 'Failed to delete FAQ' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully',
    });
  } catch (error) {
    console.error('Error in DELETE /api/faq/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
