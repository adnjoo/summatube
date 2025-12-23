import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FaBars } from 'react-icons/fa6';

import LoginDialog from '@/components/auth/LoginDialog';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui';
import { AppConfig } from '@/lib/constants';
import { createClient } from '@/utils/supabase/server';

export const Nav = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    'use server';

    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect('/');
  };

  return (
    <header className='fixed inset-x-0 top-0 z-50 flex w-full items-center border-b bg-white shadow-sm dark:bg-gray-950/90'>
      <div className='my-container mx-auto flex w-full items-center justify-between'>
        {/* Sidebar Trigger for Mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='outline' size='icon' className='lg:hidden'>
              <FaBars className='h-6 w-6' />
              <span className='sr-only'>Toggle navigation menu</span>
            </Button>
          </SheetTrigger>

          {/* Logo */}
          <Link href='/'>
            <img
              className='ml-2 cursor-pointer items-center lg:flex'
              src='/logo.png'
              alt='Logo'
              width={30}
              height={30}
            />
          </Link>

          <SheetContent side='left'>
            <SheetTitle className='hidden'>Menu</SheetTitle>
            <div className='py-6'>
              <SheetClose asChild>
                <Link
                  href='/'
                  className='flex items-center py-2 text-lg font-semibold'
                  prefetch={false}
                >
                  Home
                </Link>
              </SheetClose>
              <SheetClose asChild>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <nav className='hidden gap-6 lg:flex'>
        </nav>
      </div>
    </header>
  );
};
