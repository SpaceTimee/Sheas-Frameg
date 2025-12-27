import nextPlugin from 'eslint-config-next'

const eslintConfig = [
  { ignores: ['.next/**', '.idx/**', 'node_modules/**', 'dist/**', 'next-env.d.ts'] },
  ...nextPlugin
]

export default eslintConfig
