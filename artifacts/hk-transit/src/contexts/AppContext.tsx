import { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, Translations } from "@/lib/translations";

interface AppContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  t: Translations;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const FONT_STEPS = [12, 13, 14, 15, 16, 17, 18, 20];
const DEFAULT_FONT_STEP = 2;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("hk_transit_lang") as Language) || "en";
  });

  const [fontStep, setFontStep] = useState<number>(() => {
    const stored = localStorage.getItem("hk_transit_font_step");
    return stored ? parseInt(stored, 10) : DEFAULT_FONT_STEP;
  });

  const fontSize = FONT_STEPS[fontStep] ?? 14;

  useEffect(() => {
    document.documentElement.style.setProperty("--base-font-size", `${fontSize}px`);
  }, [fontSize]);

  const setLanguage = (l: Language) => {
    setLanguageState(l);
    localStorage.setItem("hk_transit_lang", l);
  };

  const increaseFontSize = () => {
    setFontStep((prev) => {
      const next = Math.min(prev + 1, FONT_STEPS.length - 1);
      localStorage.setItem("hk_transit_font_step", String(next));
      return next;
    });
  };

  const decreaseFontSize = () => {
    setFontStep((prev) => {
      const next = Math.max(prev - 1, 0);
      localStorage.setItem("hk_transit_font_step", String(next));
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        fontSize,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
