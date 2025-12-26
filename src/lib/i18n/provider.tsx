'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import en from './locales/en.json'
import zh from './locales/zh.json'

type Language = 'en' | 'zh'

type Translations = {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  [key: string]: any
}

const translations: Record<Language, Translations> = {
  en,
  zh
}

const FALLBACK_LANGUAGE: Language = 'en'

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language | ((lang: Language) => Language)) => void
  t: (key: string, replacements?: { [key: string]: string | number }) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(FALLBACK_LANGUAGE)

  const t = useCallback(
    (key: string, replacements?: { [key: string]: string | number }) => {
      const getNestedTranslation = (trans: Translations, key: string): string | undefined => {
        return key.split('.').reduce((obj, keyPart) => (obj ? obj[keyPart] : undefined), trans) as unknown as
          | string
          | undefined
      }

      const primaryTranslation = getNestedTranslation(translations[language], key)
      let translation = primaryTranslation ?? getNestedTranslation(translations[FALLBACK_LANGUAGE], key)

      if (!translation) {
        return key
      }

      if (replacements) {
        Object.entries(replacements).forEach(([keyToReplace, value]) => {
          translation = translation!.replace(`{{${keyToReplace}}}`, String(value))
        })
      }

      return translation
    },
    [language]
  )

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
