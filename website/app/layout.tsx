import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { Provider } from '@/components/provider';
import { appName, siteUrl } from '@/lib/shared';
import './global.css';

const inter = Inter({
  subsets: ['latin'],
});

const description =
  'OpenSpec is a lightweight agreement layer between you and your AI. Agree on what to do before any work starts. Works with 30+ AI assistants — for software, operations, HR, finance, marketing, and every office team.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${appName} | Agree first, then deliver confidently`,
    template: `%s | ${appName}`,
  },
  description,
  openGraph: {
    title: `${appName} | Agree first, then deliver confidently`,
    description,
    siteName: appName,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: appName,
    description,
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
