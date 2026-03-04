/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Silenciar aviso: Next.js 16 usa Turbopack por defecto; tenemos webpack config
  turbopack: {},
  webpack: (config, { dev }) => {
    // Solo externals de canvas en build (por si alguna dep lo requiere)
    if (!dev) {
      config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    }
    return config;
  },
};

module.exports = nextConfig;

