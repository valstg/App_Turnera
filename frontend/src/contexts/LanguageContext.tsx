import React, { createContext, useState, useContext, useEffect,  useCallback } from 'react';
import type { ReactNode } from 'react';  // <-- importación separada y tipada
interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

export const supportedLanguages: { [key: string]: { name: string; nativeName: string; flagUrl: string } } = {
  en: { name: 'English', nativeName: 'English', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Flag_of_the_United_Kingdom_%281-2%29.svg' },
  es: { name: 'Spanish', nativeName: 'Español', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg' },
  fr: { name: 'French', nativeName: 'Français', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Flag_of_France.svg' },
  pt: { name: 'Portuguese', nativeName: 'Português', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Flag_of_Portugal.svg' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedTranslation = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((o, key) => (o && o[key] !== 'undefined' ? o[key] : undefined), obj);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<string>(() => {
    const savedLocale = localStorage.getItem('locale');
    return savedLocale && supportedLanguages[savedLocale] ? savedLocale : 'en';
  });
  const [translations, setTranslations] = useState<any>({});

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const response = await fetch(`/locales-${locale}.json`);
        if (!response.ok) {
          throw new Error(`Could not load locales-${locale}.json`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Failed to fetch translations:", error);
        if (locale !== 'en') {
            setLocaleState('en');
        }
      }
    };

    fetchTranslations();
  }, [locale]);

  const setLocale = (newLocale: string) => {
    if (supportedLanguages[newLocale]) {
        localStorage.setItem('locale', newLocale);
        setLocaleState(newLocale);
    }
  };

  const t = useCallback((key: string, replacements?: { [key: string]: string | number }): string => {
    let translation = getNestedTranslation(translations, key) || key;
    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, String(replacements[placeholder]));
      });
    }
    return translation;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};