'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from 'react'
import en from './locales/en.json'
import zh from './locales/zh.json'

export type Language = 'en' | 'zh'

interface Translations {
  [translationKey: string]: string | Translations
}

const translationDictionaries = { en, zh } satisfies Record<Language, Translations>

const FALLBACK_LANGUAGE: Language = 'en'

export type Translator = (translationKey: string, replacements?: Record<string, string | number>) => string

interface LanguageContextValue {
  language: Language
  setLanguage: Dispatch<SetStateAction<Language>>
  translate: Translator
}

interface LanguageProviderProps {
  children: ReactNode
}

const getNestedTranslation = (
  sourceTranslations: Translations,
  translationPath: string
): string | undefined => {
  let currentValue: string | Translations | undefined = sourceTranslations

  for (const pathSegment of translationPath.split('.')) {
    if (typeof currentValue !== 'object' || !(pathSegment in currentValue)) return undefined
    currentValue = currentValue[pathSegment]
  }

  return typeof currentValue === 'string' ? currentValue : undefined
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState(FALLBACK_LANGUAGE)

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
