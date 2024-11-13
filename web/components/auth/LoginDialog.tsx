'use client';

import Link from 'next/link';

import { GoogleIcon } from '@/components/icons/GoogleIcon';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui';
import { AppConfig } from '@/lib/constants';
import { useUser } from '@/lib/hooks/useUser';
import { createClient } from '@/utils/supabase/client';

export default function LoginDialog() {
  const supabase = createClient();
  const user = useUser();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${AppConfig.SITE_MAP.AUTH_CALLBACK}`,
      },
    });
    if (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <Dialog>
      {user ? (
        <p>Welcome, {user.email}</p>
      ) : (
        <>
          <DialogTrigger asChild>
            <Button variant='outline'>Sign In</Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>
              <DialogDescription>
                Sign in with your Google account to continue.
              </DialogDescription>
            </DialogHeader>
            <div className='flex items-center justify-center py-4'>
              <Button
                onClick={handleGoogleLogin}
                className='flex w-full items-center justify-center gap-2'
                variant='outline'
              >
                <GoogleIcon className='h-6 w-6' />
                Sign in with Google
              </Button>
            </div>
            <DialogFooter className='mt-4 text-center'>
              <Link
                href={AppConfig.SITE_MAP.TERMS}
                target='_blank'
                className='text-sm hover:underline'
              >
                By signing in, you agree to our terms and conditions.
              </Link>
            </DialogFooter>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}
