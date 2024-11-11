import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Footer } from '@/components/layout/Footer';
import { Nav } from '@/components/layout/Nav';
import { AppConfig } from '@/lib/constants';
import Providers from '@/utils/rq/queryClient';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: AppConfig.META.TITLE,
  description: AppConfig.META.DESCRIPTION,
  twitter: {
    card: 'summary_large_image',
    site: AppConfig.SOCIAL.X,
    title: AppConfig.APP_NAME,
    creator: AppConfig.SOCIAL.X,
    images: {
      url: `${AppConfig.SITE_URL}/x-image.png`,
      alt: AppConfig.APP_NAME,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Providers>
          <Nav />
          <main className='my-container min-h-[80vh] pt-16 sm:pt-8'>
            {children}
          </main>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
