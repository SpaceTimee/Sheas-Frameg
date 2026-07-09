'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import GithubIcon from '@/components/icons/github-icon'
import LanguageSwitcher from '@/components/language-switcher'
import ThemeSwitcher from '@/components/theme-switcher'
import { externalLinkProps, site } from '@/lib/consts'
import { useLanguage } from '@/lib/i18n/provider'
import { mergeClassNames } from '@/lib/utils'
import appIcon from '@/app/icon.png'

export default function Header() {
  const { translate } = useLanguage()
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    let ticking = false

    const updateScrollState = () => {
      setHasScrolled((hasScrolled) => window.scrollY > (hasScrolled ? 4 : 12))
      ticking = false
    }

    updateScrollState()

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return
        ticking = true
        window.requestAnimationFrame(updateScrollState)
      },
      { passive: true, signal: controller.signal }
    )

    return () => controller.abort()
  }, [])

  return (
    <header className="bg-card/80 sticky top-0 z-50 border-b shadow-sm backdrop-blur-sm">
      <div
        className={mergeClassNames(
          'container mx-auto flex items-center justify-between px-8 transition-all duration-300 ease-out',
          hasScrolled ? 'h-14' : 'h-16'
        )}
      >
        <Link
          href="/"
          className="ring-offset-background focus-visible:ring-ring flex items-center gap-2 rounded-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          aria-label={translate('header.homeAriaLabel')}
        >
          <Image src={appIcon} alt="" width={28} height={28} className="size-7" priority />
          <h1 className="font-headline text-xl whitespace-nowrap">Sheas FrameG</h1>
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link
              href={site.githubUrl}
              {...externalLinkProps}
              aria-label={translate('header.githubAriaLabel')}
            >
              <GithubIcon className="size-4" />
            </Link>
          </Button>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  )
}
