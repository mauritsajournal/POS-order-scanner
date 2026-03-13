import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@scanorder/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
