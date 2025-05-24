const nextTranslate = require('next-translate-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
  },
}

module.exports = nextTranslate(nextConfig);
