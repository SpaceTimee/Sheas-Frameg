'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { GitFork } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LanguageSwitcher from '@/components/language-switcher'
import ThemeSwitcher from '@/components/theme-switcher'
import { useLanguage } from '@/lib/i18n/provider'
import { mergeClassNames } from '@/lib/utils'
import appIcon from '@/app/icon.png'

export default function Header() {
  const { translate } = useLanguage()
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const updateScrollState = () => setHasScrolled((hasScrolled) => window.scrollY > (hasScrolled ? 4 : 12))

    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  return (
    <header className="border-b bg-card/80 shadow-sm backdrop-blur-sm sticky top-0 z-50">
      <div
        className={mergeClassNames(
          'container mx-auto flex items-center justify-between px-8 ease-out transition-all duration-300',
          hasScrolled ? 'h-14' : 'h-16'
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={translate('header.homeAriaLabel')}
        >
          <Image src={appIcon} alt="" width={28} height={28} className="h-7 w-7" priority />
          <h1 className="font-headline text-xl whitespace-nowrap">Sheas FrameG</h1>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href="https://github.com/SpaceTimee/Sheas-Frameg"
              target="_blank"
              rel="noopener"
              aria-label={translate('header.githubAriaLabel')}
            >
              <GitFork className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  )
}
