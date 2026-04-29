import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://tol-langit-dashboard.vercel.app';
const SITE_NAME = 'TOL LANGIT Capital';
const TITLE = 'TOL LANGIT Capital — Verified Algorithmic Trading Signals | Singapore';
const DESCRIPTION =
  'Four independently verified live algorithmic trading strategies on IC Markets (ASIC). Over +1,447% cumulative return on TLV10 since 2021. Real-money accounts, publicly verifiable on MQL5 and MyFXBook. Open for copy trading — no lock-in.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    'algorithmic trading Singapore',
    'forex copy trading',
    'MQL5 signals',
    'verified trading strategy',
    'IC Markets signal',
    'ASIC regulated broker',
    'automated forex EA',
    'TOL LANGIT',
    'TLV10 strategy',
    'MyFXBook verified',
    'gold trading algorithm',
    'XAU USD strategy',
    'MT4 EA Singapore',
    'MT5 expert advisor',
    'low risk forex strategy',
    'profit factor 2.73',
    'systematic trading',
    'quantitative trading',
  ],
  authors: [{ name: 'Adithyo Dewangga Wijaya', url: 'https://sg.linkedin.com/in/adithyodewangga' }],
  creator: 'Adithyo Dewangga Wijaya',
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    creator: '@tol_langit',
  },
  other: {
    'theme-color': '#001233',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      foundingDate: '2021',
      foundingLocation: { '@type': 'Place', name: 'Singapore' },
      founder: {
        '@type': 'Person',
        name: 'Adithyo Dewangga Wijaya',
        jobTitle: 'Algorithmic Strategy Developer',
        url: 'https://sg.linkedin.com/in/adithyodewangga',
      },
      sameAs: [
        'https://www.mql5.com/en/users/adithyodw',
        'https://www.myfxbook.com/members/adithyodw',
        'https://github.com/adithyodw',
        'https://t.me/tol_langit',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { '@id': `${SITE_URL}/#website` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#001233" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="canonical" href={SITE_URL} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,700;1,400&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
