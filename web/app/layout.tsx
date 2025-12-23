import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Footer } from '@/components/layout/Footer';
import { AppConfig } from '@/lib/constants';

import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: AppConfig.META.TITLE,
  description: AppConfig.META.DESCRIPTION,
  keywords: [
    'YouTube summary',
    'YouTube transcript',
    'AI video summary',
    'Chrome extension',
    'video summarizer',
    'YouTube AI',
    'video transcripts',
    'YouTube captions',
    'video summarization tool',
    'YouTube helper extension',
  ],
  authors: [{ name: AppConfig.APP_NAME }],
  creator: AppConfig.APP_NAME,
  publisher: AppConfig.APP_NAME,
  metadataBase: new URL(AppConfig.SITE_URL),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    card: 'summary_large_image',
    site: AppConfig.SOCIAL.X,
    title: AppConfig.META.TITLE,
    description: AppConfig.META.DESCRIPTION,
    creator: AppConfig.SOCIAL.X,
    images: {
      url: `${AppConfig.SITE_URL}/x-image.png`,
      alt: AppConfig.APP_NAME,
    },
  },
  openGraph: {
    title: AppConfig.META.TITLE,
    description: AppConfig.META.DESCRIPTION,
    url: AppConfig.SITE_URL,
    type: 'website',
    siteName: AppConfig.APP_NAME,
    images: [
      {
        url: `${AppConfig.SITE_URL}/x-image.png`,
        width: 1200,
        height: 630,
        alt: AppConfig.APP_NAME,
      },
    ],
    locale: 'en_US',
  },
  verification: {
    // Add Google Search Console verification when available
    // google: 'your-verification-code',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <main className='my-container min-h-[80vh] pt-16 sm:pt-8'>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
