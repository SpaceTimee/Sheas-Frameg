import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, crypto: false }
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[hash][ext][query]'
      }
    })
    config.resolve.alias = {
      ...config.resolve.alias,
      'MediaInfoModule.wasm': false
    }
    return config
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin'
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp'
          }
        ]
      }
    ]
  }
}

export default nextConfig
