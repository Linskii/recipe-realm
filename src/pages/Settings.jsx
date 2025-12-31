import React from 'react';
import { useTranslation } from '../hooks/useTranslation.js';
import { useToast } from '../context/ToastContext.jsx';
import AppNav from '../components/layout/AppNav.jsx';
import Button from '../components/ui/Button.jsx';

export default function Settings() {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  const { showToast } = useToast();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' }
  ];

  const handleLanguageChange = async (languageCode) => {
    try {
      await changeLanguage(languageCode);
      showToast(t('settings.languageChanged'), 'success');
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('settings.title')}</h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('settings.language')}</h2>
          <p className="text-gray-600 mb-6">{t('settings.selectLanguage')}</p>

          <div className="grid gap-4">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                  currentLanguage === language.code
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{language.flag}</span>
                  <span className="text-lg font-medium text-gray-900">{language.name}</span>
                </div>
                {currentLanguage === language.code && (
                  <span className="text-green-600 font-medium">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 {t('settings.moreLanguagesSoon')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
