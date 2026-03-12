import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TOL LANGIT Capital - Institutional Trading Analytics',
  description:
    'Bloomberg-terminal style institutional trading analytics platform. Real-time portfolio analytics, AI insights, and strategy optimization.',
  keywords: [
    'trading',
    'portfolio',
    'analytics',
    'institutional',
    'forex',
    'bitcoin',
    'crypto',
  ],
  authors: [{ name: 'TOL LANGIT Capital' }],
  openGraph: {
    title: 'TOL LANGIT Capital - Institutional Trading Analytics',
    description: 'Bloomberg-terminal style institutional trading analytics platform',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'TOL LANGIT Capital',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,700;1,400&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
