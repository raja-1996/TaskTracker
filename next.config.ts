import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for optimal deployment
  output: 'standalone',
  
  // Optimize for production builds
  swcMinify: true,
  
  // Environment variables validation
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};

export default nextConfig;
