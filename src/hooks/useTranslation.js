import { useTranslation as useI18nextTranslation } from 'react-i18next';

export function useTranslation() {
  const { t: i18nT, i18n } = useI18nextTranslation();

  // Wrapper function that handles both simple strings and translation key objects
  const t = (key, params = {}) => {
    if (typeof key === 'object' && key !== null && key.key) {
      // Handle validation error objects with { key, params }
      return i18nT(key.key, key.params || {});
    }
    return i18nT(key, params);
  };

  // Helper function to translate validation errors
  const translateError = (errorObj) => {
    if (!errorObj) return null;
    if (typeof errorObj === 'string') {
      // If it's already a string (from old code), try to translate it
      return i18nT(errorObj);
    }
    if (typeof errorObj === 'object' && errorObj.key) {
      return i18nT(errorObj.key, errorObj.params || {});
    }
    return errorObj;
  };

  const changeLanguage = (lng) => {
    return i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return {
    t,
    translateError,
    changeLanguage,
    currentLanguage,
    i18n
  };
}
