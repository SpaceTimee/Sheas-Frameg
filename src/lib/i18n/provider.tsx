'use client'

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import en from './locales/en.json'
import zh from './locales/zh.json'

type Language = 'en' | 'zh'

type NestedTranslation = string | { [key: string]: NestedTranslation }

type Translations = Record<string, NestedTranslation>

const translations: Record<Language, Translations> = {
  en: en as Translations,
  zh: zh as Translations
}

const FALLBACK_LANGUAGE: Language = 'en'

export type Translator = (key: string, replacements?: { [key: string]: string | number }) => string

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language | ((lang: Language) => Language)) => void
  t: Translator
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(FALLBACK_LANGUAGE)

  const t = useCallback(
    (key: string, replacements?: { [key: string]: string | number }) => {
      const getNestedTranslation = (trans: Translations, path: string): string | undefined => {
        const keys = path.split('.')
        let current: NestedTranslation | undefined = trans

        for (const k of keys) {
          if (current && typeof current === 'object' && k in current) {
            current = current[k]
          } else {
            return undefined
          }
        }

        return typeof current === 'string' ? current : undefined
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
