import React from 'react';
import { useTranslation } from '../../hooks/useTranslation.js';

export default function LanguageSwitcher() {
  const { changeLanguage, currentLanguage } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const handleLanguageChange = async (languageCode) => {
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
  };

  return (
    <div className="flex gap-2">
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => handleLanguageChange(language.code)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currentLanguage === language.code
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
          }`}
          aria-label={`Switch to ${language.name}`}
        >
          <span>{language.flag}</span>
          <span>{language.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
