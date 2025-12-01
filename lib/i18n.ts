import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "../i18n/de.json";

i18n
  .use(initReactI18next)
  .init({
    lng: "de",
    fallbackLng: "de",
    defaultNS: "translation",
    interpolation: {
      escapeValue: false
    },
    resources: {
      de: {
        translation: de
      }
    }
  });

export default i18n;
