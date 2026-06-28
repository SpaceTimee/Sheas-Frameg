import type { NextConfig } from 'next'
import withPWA from '@ducanh2912/next-pwa'

const nextConfig: NextConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})({
  reactStrictMode: true,
  webpack: (webpackConfig, { webpack }) => {
    webpackConfig.resolve.fallback = {
      ...webpackConfig.resolve.fallback,
      fs: false,
      path: false,
      crypto: false
    }
    webpackConfig.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/wasm/[hash][ext][query]'
      }
    })
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      'MediaInfoModule.wasm': false
    }
    webpackConfig.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /MediaInfoModule\.wasm$/
      })
    )
    return webpackConfig
  },
  headers: () => [
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
  ],
  rewrites: () => ({
    fallback: [
      {
        source: '/:path*',
        destination: '/'
      }
    ]
  })
})

export default nextConfig
