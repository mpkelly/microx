/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Uncomment and set this if deploying to a subpath like username.github.io/microx
  // basePath: '/microx',
  // assetPrefix: '/microx/',
  trailingSlash: true,
};

module.exports = nextConfig;
