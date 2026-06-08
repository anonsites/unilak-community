import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get all reactions for the review
    const { data: reactions, error } = await supabase
      .from('reactions')
      .select('emoji_type, user_id')
      .eq('review_id', id);

    if (error) {
      console.error('Error fetching reactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reactions' },
        { status: 500 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    // Build reactions_count JSONB and track user's reactions
    const reactionsCount: Record<string, number> = {};
    const userReactions = new Set<string>();

    reactions?.forEach((reaction) => {
      reactionsCount[reaction.emoji_type] = (reactionsCount[reaction.emoji_type] || 0) + 1;
      
      if (user?.id === reaction.user_id) {
        userReactions.add(reaction.emoji_type);
      }
    });

    return NextResponse.json({
      success: true,
      reactions_count: reactionsCount,
      user_reactions: Array.from(userReactions)
    });
  } catch (error) {
    console.error('Unexpected error in GET reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const { emoji_type } = await req.json();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!emoji_type) {
      return NextResponse.json(
        { error: 'emoji_type is required' },
        { status: 400 }
      );
    }

    // Check if review exists
    const { data: review, error: reviewError } = await supabase
      .from('reviews_table')
      .select('id')
      .eq('id', id)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user already has this reaction
    const { data: existingReaction, error: checkError } = await supabase
      .from('reactions')
      .select('id')
      .eq('review_id', id)
      .eq('user_id', user.id)
      .eq('emoji_type', emoji_type)
      .single();

    let action = 'added';

    if (existingReaction) {
      // User already reacted with this emoji, so remove it (toggle)
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id);

      if (deleteError) {
        console.error('Error deleting reaction:', deleteError);
        return NextResponse.json(
          { error: 'Failed to remove reaction' },
          { status: 500 }
        );
      }
      action = 'removed';
    } else {
      // Add new reaction
      const { error: insertError } = await supabase
        .from('reactions')
        .insert([
          {
            review_id: id,
            user_id: user.id,
            emoji_type: emoji_type
          }
        ]);

      if (insertError) {
        console.error('Error inserting reaction:', insertError);
        return NextResponse.json(
          { error: 'Failed to add reaction' },
          { status: 500 }
        );
      }
    }

    // Get updated reactions count
    const { data: reactions, error: fetchError } = await supabase
      .from('reactions')
      .select('emoji_type')
      .eq('review_id', id);

    if (fetchError) {
      console.error('Error fetching updated reactions:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch updated reactions' },
        { status: 500 }
      );
    }

    // Build reactions_count
    const reactionsCount: Record<string, number> = {};
    reactions?.forEach((reaction) => {
      reactionsCount[reaction.emoji_type] = (reactionsCount[reaction.emoji_type] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      action,
      reactions_count: reactionsCount
    });
  } catch (error) {
    console.error('Unexpected error in POST reactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
