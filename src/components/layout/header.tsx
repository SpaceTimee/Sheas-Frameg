'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Github } from 'lucide-react'
import { Button } from '../ui/button'
import LanguageSwitcher from '../language-switcher'
import { cn } from '@/lib/utils'
import appIcon from '@/app/icon.png'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 transition-all duration-300">
      <div
        className={cn(
          'container mx-auto flex items-center justify-between px-8 transition-all duration-300',
          scrolled ? 'h-14' : 'h-16'
        )}
      >
        <Link href="/" className="flex items-center gap-2" aria-label="Sheas FrameG Home">
          <Image src={appIcon} alt="Sheas FrameG Logo" width={28} height={28} className="h-7 w-7" />
          <h1 className="text-xl font-headline whitespace-nowrap">Sheas FrameG</h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="https://github.com/SpaceTimee/Sheas-Frameg"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
          >
            <Button variant="ghost" size="icon">
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub Repository</span>
            </Button>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
