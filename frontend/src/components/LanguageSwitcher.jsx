import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ur" : "en";
    i18n.changeLanguage(newLang);
  };

  const currentFlag = i18n.language === "en" ? "🇬🇧" : "🇵🇰";

  return (
    <button
      onClick={toggleLanguage}
      className="w-full flex items-center justify-center lg:justify-start gap-3 p-2 lg:p-3 rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors group"
      title={i18n.language === "en" ? "Switch to Urdu" : "Switch to English"}
    >
      <Globe
        size={20}
        className="text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform"
      />
      <span className="text-lg">{currentFlag}</span>
      <span className="font-medium text-gray-900 dark:text-white hidden lg:block">
        {i18n.language === "en" ? "English" : "اردو"}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
