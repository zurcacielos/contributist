import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { Analytics } from '@vercel/analytics/react';
import '../globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contributist | GitHub Contribution Graph Generator & Painter',
  description: 'Contributist is an interactive visual tool to paint custom pixel art on your GitHub contribution graph. Generate and customize your git commit history grid easily.',
  keywords: [
    'github contribution generator',
    'github contribution graph',
    'github contribution painter',
    'contributist',
    'git green grass generator',
    'github profile customizer',
    'commit painter'
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming locale is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Get messages for NextIntlClientProvider
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
