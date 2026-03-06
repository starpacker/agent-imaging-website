/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '',
  trailingSlash: true,
  transpilePackages: ['react-compare-slider'],
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
