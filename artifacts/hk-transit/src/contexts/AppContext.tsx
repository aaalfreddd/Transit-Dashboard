import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Language, translations, Translations } from "@/lib/translations";
import { applyThemeColor, resetTheme, getDefaultBg } from "@/lib/theme";

interface AppContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  t: Translations;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  bgColor: string;
  setBgColor: (c: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const FONT_STEPS = [12, 13, 14, 15, 16, 17, 18, 20];
const DEFAULT_FONT_STEP = 2;
const DEFAULT_BG = getDefaultBg();

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("hk_transit_lang") as Language) || "en";
  });

  const [fontStep, setFontStep] = useState<number>(() => {
    const stored = localStorage.getItem("hk_transit_font_step");
    return stored ? parseInt(stored, 10) : DEFAULT_FONT_STEP;
  });

  const [bgColor, setBgColorState] = useState<string>(() => {
    return localStorage.getItem("hk_transit_bg_color") || DEFAULT_BG;
  });

  const fontSize = FONT_STEPS[fontStep] ?? 14;

  useEffect(() => {
    document.documentElement.style.setProperty("--base-font-size", `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    if (bgColor && bgColor !== DEFAULT_BG) {
      applyThemeColor(bgColor);
    } else {
      resetTheme();
    }
  }, [bgColor]);

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

  const setBgColor = useCallback((c: string) => {
    setBgColorState(c);
    localStorage.setItem("hk_transit_bg_color", c);
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        bgColor,
        setBgColor,
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
