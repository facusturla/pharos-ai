import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow Leaflet CSS to be imported
  transpilePackages: ['leaflet', 'react-leaflet'],
};

export default nextConfig;
