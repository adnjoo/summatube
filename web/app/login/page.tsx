'use client';

import Link from 'next/link';

import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { AppConfig } from '@/lib/constants';
import { createClient } from '@/utils/supabase/client';

export default function Login() {
  const supabase = createClient();

  // Google OAuth login handler
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${AppConfig.SITE_MAP.API.AUTH_CALLBACK}`,
      },
    });
    if (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <section className='mx-auto mt-32 flex flex-col items-center justify-between'>
      <div className='w-full max-w-md border-2 border-black p-8'>
        <Link
          href='/'
          className='mb-8 flex items-center space-x-2 text-black no-underline hover:underline'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <polyline points='15 18 9 12 15 6' />
          </svg>
          <span>Back</span>
        </Link>

        <button
          type='button'
          onClick={handleGoogleLogin}
          className='mt-4 flex w-full items-center justify-center space-x-2 border border-black px-4 py-2'
        >
          <GoogleIcon className='h-6 w-6' />
          <span>Sign In with Google</span>
        </button>
      </div>
    </section>
  );
}
