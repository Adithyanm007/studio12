import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devServer: {
    // With this option, Next.js will dynamically allow all origins in a cloud-based development environment.
    // This is safe in this context because the environment is already secured.
    allowedForwardedHosts: ['localhost'],
  }
};

export default nextConfig;
