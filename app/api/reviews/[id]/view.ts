import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Use the RPC function to increment view count atomically
    const { error } = await supabase.rpc('increment_review_view_count', { 
      p_review_id: id 
    });

    if (error) {
      console.error('Error incrementing review view count:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the updated count
    const { data: review, error: fetchError } = await supabase
      .from('reviews_table')
      .select('view_count')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated review view count:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch view count' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      view_count: review?.view_count || 0
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Unexpected error in view tracking:', message);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
