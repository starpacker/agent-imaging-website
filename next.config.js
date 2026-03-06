/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/agent-imaging-website',
  trailingSlash: true,
  transpilePackages: ['react-compare-slider'],
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
