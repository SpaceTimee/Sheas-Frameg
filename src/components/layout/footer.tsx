'use client'

import { useLanguage } from '@/lib/i18n/provider'
import { memo } from 'react'

function FooterComponent() {
  const { t } = useLanguage()
  return (
    <footer className="py-6 px-4 text-center text-xs text-muted-foreground">
      <p>{t('footerText')}</p>
    </footer>
  )
}

const Footer = memo(FooterComponent)
export default Footer
