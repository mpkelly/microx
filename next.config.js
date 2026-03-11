/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/microx',
  assetPrefix: '/microx/',
  trailingSlash: true,
};

module.exports = nextConfig;
