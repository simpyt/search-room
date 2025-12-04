import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
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
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        {children}
        <Toaster richColors position="top-right" />
        <SpeedInsights />
      </body>
    </html>
  );
}
