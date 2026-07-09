'use client'

import { site } from '@/lib/consts'
import { useLanguage } from '@/lib/i18n/provider'

export default function Footer() {
  const { translate } = useLanguage()
  return (
    <footer className="text-muted-foreground px-4 py-6 text-center text-xs">
      <p>{translate('footerText', { version: site.version })}</p>
    </footer>
  )
}
