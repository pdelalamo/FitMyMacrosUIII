import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json'; // Import English translations
import esTranslation from './locales/es.json'; // Import Spanish translations
import frTranslation from './locales/es.json'; // Import French translations
import ptTranslation from './locales/es.json'; // Import Portuguese translations
import ruTranslation from './locales/es.json'; // Import Russian translations

i18n
    .use(initReactI18next) // Initialize i18next for React
    .init({
        compatibilityJSON: 'v3',
        resources: {
            en: { translation: enTranslation }, // English translations
            es: { translation: esTranslation }, // Spanish translations
            fr: { translation: enTranslation }, // French translations
            pt: { translation: esTranslation }, // Portuguese translations
            ru: { translation: enTranslation }, // Russian translations
        },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
