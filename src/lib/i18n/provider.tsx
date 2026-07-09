'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode
} from 'react'
import en from '@/lib/i18n/locales/en.json'
import zh from '@/lib/i18n/locales/zh.json'

export type Language = 'en' | 'zh'

interface Translations {
  [translationKey: string]: string | Translations
}

const translationDictionaries = { en, zh } satisfies Record<Language, Translations>

const FALLBACK_LANGUAGE: Language = 'en'

const getLanguageSnapshot = (): Language => {
  try {
    const stored = localStorage.getItem('language')
    if (stored && Object.hasOwn(translationDictionaries, stored)) return stored as Language
  } catch {}
  return (navigator.languages[0] ?? navigator.language).toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

const getServerLanguageSnapshot = (): Language => FALLBACK_LANGUAGE

const subscribeToLanguage = (onStoreChange: () => void) => {
  const controller = new AbortController()
  for (const type of ['storage', 'frameg-language-change'] as const) {
    window.addEventListener(type, onStoreChange, { signal: controller.signal })
  }
  return () => controller.abort()
}

const setLanguage = (language: Language) => {
  try {
    localStorage.setItem('language', language)
  } catch {}
  window.dispatchEvent(new Event('frameg-language-change'))
}

export type Translator = (translationKey: string, replacements?: Record<string, string | number>) => string

const getNestedTranslation = (
  sourceTranslations: Translations,
  translationPath: string
): string | undefined => {
  let currentValue: string | Translations | undefined = sourceTranslations

  for (const pathSegment of translationPath.split('.')) {
    if (typeof currentValue !== 'object' || !Object.hasOwn(currentValue, pathSegment)) return undefined
    currentValue = currentValue[pathSegment]
  }

  return typeof currentValue === 'string' ? currentValue : undefined
}

const LanguageContext = createContext<
  | {
      language: Language
      setLanguage: (language: Language) => void
      translate: Translator
    }
  | undefined
>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribeToLanguage, getLanguageSnapshot, getServerLanguageSnapshot)

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
  }, [language])

  const translate = useCallback<Translator>(
    (translationKey, replacements) => {
      const translationTemplate =
        getNestedTranslation(translationDictionaries[language], translationKey) ??
        getNestedTranslation(translationDictionaries[FALLBACK_LANGUAGE], translationKey)

      if (translationTemplate === undefined) return translationKey
      if (!replacements) return translationTemplate

      return Object.entries(replacements).reduce(
        (translatedText, [placeholderKey, replacementValue]) =>
          translatedText.replaceAll(`{{${placeholderKey}}}`, String(replacementValue)),
        translationTemplate
      )
    },
    [language]
  )

  const languageContextValue = useMemo(() => ({ language, setLanguage, translate }), [language, translate])

  return <LanguageContext.Provider value={languageContextValue}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const languageContext = useContext(LanguageContext)
  if (languageContext === undefined) throw new Error('useLanguage must be used within a LanguageProvider')
  return languageContext
}
