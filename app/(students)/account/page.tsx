import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import AccountClient from './AccountClient';

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: profile } = await supabase
    .from('profiles_table')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <AccountClient
      user={user}
      profile={profile}
    />
  );
}