'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from 'react'
import en from './locales/en.json'
import zh from './locales/zh.json'

type Language = 'en' | 'zh'

interface Translations {
  [key: string]: string | Translations
}

const translations: Record<Language, Translations> = {
  en: en as Translations,
  zh: zh as Translations
}

const FALLBACK_LANGUAGE: Language = 'en'

export type Translator = (key: string, replacements?: Record<string, string | number>) => string

const LanguageContext = createContext<
  | {
      language: Language
      setLanguage: Dispatch<SetStateAction<Language>>
      t: Translator
    }
  | undefined
>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(FALLBACK_LANGUAGE)

  const t = useCallback<Translator>(
    (key, replacements) => {
      const getNestedTranslation = (trans: Translations, path: string): string | undefined => {
        const keys = path.split('.')
        let current: string | Translations | undefined = trans

        for (const key of keys) {
          if (current && typeof current === 'object' && key in current) current = current[key]
          else return undefined
        }

        return typeof current === 'string' ? current : undefined
      }

      const translation =
        getNestedTranslation(translations[language], key) ??
        getNestedTranslation(translations[FALLBACK_LANGUAGE], key)

      if (!translation) return key
      if (!replacements) return translation

      return Object.entries(replacements).reduce((result, [key, value]) => {
        return result.split(`{{${key}}}`).join(String(value))
      }, translation)
    },
    [language]
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}
