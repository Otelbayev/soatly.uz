/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http',  hostname: 'localhost', port: '5000', pathname: '/uploads/**' },
      { protocol: 'http',  hostname: 'backend',   port: '5000', pathname: '/uploads/**' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
