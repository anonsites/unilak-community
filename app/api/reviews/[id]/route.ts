import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Use the RPC function to bypass RLS and update count atomically
    const { error } = await supabase.rpc('increment_review_view_count', { 
      p_review_id: id 
    });

    if (error) {
      console.error('Error incrementing view count:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the updated count
    const { data } = await supabase
      .from('reviews_table')
      .select('view_count')
      .eq('id', id)
      .single();

    return NextResponse.json({ success: true, view_count: data?.view_count || 0 });
  } catch (error) {
    console.error('Unexpected error in view tracking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}