import type { Metadata } from 'next';
import { Geist, Geist_Mono, Source_Sans_3 } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@/components/ui/sonner';
import { getTheme } from '@/lib/theme';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Homegate uses Source Sans Pro (now Source Sans 3)
const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Search Room - Collaborative Property Search',
  description: 'Find your perfect home together with AI-powered collaborative search',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = getTheme();
  const isHomegate = theme === 'homegate';

  // Build class names based on theme
  const htmlClasses = isHomegate ? 'theme-homegate' : 'dark';
  const bodyClasses = [
    geistSans.variable,
    geistMono.variable,
    sourceSans.variable,
    'antialiased',
    isHomegate ? 'bg-white text-gray-900 font-[family-name:var(--font-source-sans)]' : 'bg-slate-950 text-slate-50',
  ].join(' ');

  return (
    <html lang="en" className={htmlClasses}>
      <body className={bodyClasses}>
        {children}
        <Toaster richColors position="top-right" />
        <SpeedInsights />
      </body>
    </html>
  );
}
