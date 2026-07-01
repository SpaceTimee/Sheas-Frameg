'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/provider'

const emptySubscribe = () => () => {}

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export default function ThemeSwitcher() {
  const { resolvedTheme, setTheme } = useTheme()
  const { translate } = useLanguage()
  const isMounted = useIsMounted()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={translate('themeSwitcher.toggleAriaLabel')}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      disabled={!isMounted}
    >
      {isMounted && isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </Button>
  )
}
