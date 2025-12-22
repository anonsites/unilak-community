import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';

export default async function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles_table')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'moderator') {
    redirect('/');
  }

  return <>{children}</>;
}