import Link from 'next/link';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';

// import { Separator } from '@/components/ui/separator';
import { AppConfig } from '@/lib/constants';

export function Footer() {
  return (
    <footer className='w-full bg-background py-6'>
      <div className='my-container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row md:py-0'>
        <div className='flex flex-col items-start gap-4 px-8 md:gap-2 md:px-0'>
          <h2 className='hidden items-center gap-1 text-center text-lg font-semibold md:flex'>
            <Link href='/'>
              <img src='/logo.png' alt='logo' className='h-8 w-auto' />
            </Link>
            <span>{AppConfig.APP_NAME}</span>
          </h2>

          <p className='hidden text-center text-sm text-muted-foreground md:flex'>
            {AppConfig.APP_DESCRIPTION}
          </p>
          <p className='hidden text-center text-sm leading-loose text-muted-foreground md:flex'>
            © {new Date().getFullYear()} {AppConfig.APP_NAME}. All rights
            reserved.
          </p>
        </div>
        <nav className='flex items-center space-x-4 text-sm font-medium'>
          <Link
            href={AppConfig.SOCIAL.GITHUB}
            target='_blank'
            className='flex flex-row gap-1 text-muted-foreground hover:text-foreground'
          >
            <FaGithub className='h-5 w-5' />
          </Link>

          <Link
            href={AppConfig.SOCIAL.X}
            target='_blank'
            className='flex flex-row gap-1 text-muted-foreground hover:text-foreground'
          >
            <FaXTwitter className='h-5 w-5' />
          </Link>
          <Link
            href={AppConfig.SITE_MAP.PRIVACY}
            className='text-muted-foreground hover:text-foreground'
          >
            Privacy
          </Link>
          <Link
            href={AppConfig.SITE_MAP.TERMS}
            className='text-muted-foreground hover:text-foreground'
          >
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
