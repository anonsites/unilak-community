import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import { Database } from '@/lib/database.types';
import AccountClient from './AccountClient';

type ReviewWithRelations = Database['public']['Tables']['reviews_table']['Row'] & {
  profiles_table: { username: string } | null;
  topics_table: { name: string } | null;
  subtopics_table: { name: string } | null;
};


export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const [profileResult, reviewsResult] = await Promise.all([
    supabase
      .from('profiles_table')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('reviews_table')
      .select(`
        *,
        profiles_table (username),
        topics_table (name),
        subtopics_table (name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
  ]);

  return (
    <AccountClient
      user={user}
      profile={profileResult.data}
      reviews={(reviewsResult.data as ReviewWithRelations[]) || []}
    />
  );
}