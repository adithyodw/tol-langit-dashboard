/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use React 18 with strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Internationalization
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },

  // Security headers
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Redirects & rewrites
  redirects: async () => {
    return [];
  },

  rewrites: async () => {
    return [];
  },

  // Webpack optimization
  webpack: (config) => {
    config.optimization.usedExports = true;
    return config;
  },
};

module.exports = nextConfig;
