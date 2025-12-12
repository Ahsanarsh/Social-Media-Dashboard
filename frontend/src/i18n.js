import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "./locales/en/translation.json";
import urTranslation from "./locales/ur/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  ur: {
    translation: urTranslation,
  },
};

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem("language") || "en";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage, // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already escapes
  },
  react: {
    useSuspense: false,
  },
});

// Save language preference when it changes
i18n.on("languageChanged", (lng) => {
  localStorage.setItem("language", lng);
  // Update document direction for RTL languages
  document.documentElement.dir = lng === "ur" ? "rtl" : "ltr";
  document.documentElement.lang = lng;
});

// Set initial direction
document.documentElement.dir = savedLanguage === "ur" ? "rtl" : "ltr";
document.documentElement.lang = savedLanguage;

export default i18n;
