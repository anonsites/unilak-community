import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabaseServer';
import AuthForm from '@/components/AuthForm';
import AuthHelp from '@/components/AuthHelp';

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/account');
  }

  const { next } = await searchParams;
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col md:flex-row">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-wider mb-2">WELCOME</h1>
            <p className="text-gray-400 text-sm">Join the UNILAK Community</p>
          </div>
          <AuthForm next={next || '/'} />
        </div>

        {/* Right Side: Help */}
        <div className="w-full md:w-1/2 bg-gray-800/30 border-t md:border-t-0 md:border-l border-gray-800">
          <AuthHelp />
        </div>
      </div>
    </main>
  );
}