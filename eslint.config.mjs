import nextPlugin from 'eslint-config-next'

const eslintConfig = [{ ignores: ['.next/**', 'next-env.d.ts'] }, ...nextPlugin]

export default eslintConfig
