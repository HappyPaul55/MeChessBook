const nextTranslate = require('next-translate-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export',
  devIndicators: false,
  experimental: {
    reactCompiler: true,
  },
}

module.exports = nextTranslate(nextConfig);
