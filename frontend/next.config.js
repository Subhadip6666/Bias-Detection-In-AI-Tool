/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // This allows the frontend to be deployed in a subdirectory if needed,
  // but for Vercel root directory config is usually better.
}

module.exports = nextConfig
