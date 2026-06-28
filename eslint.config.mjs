import nextPlugin from 'eslint-config-next'

const eslintConfig = [
  { ignores: ['.idx/**', '.next/**', 'dist/**', 'node_modules/**', 'next-env.d.ts'] },
  ...nextPlugin
]

export default eslintConfig
