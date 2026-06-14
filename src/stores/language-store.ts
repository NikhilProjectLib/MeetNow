"use client";

import { create } from "zustand";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "th", name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
];

interface LanguageState {
  language: Language;
  hydrated: boolean;
  setLanguage: (lang: Language) => void;
  hydrate: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: LANGUAGES[0], // Always start with English to avoid hydration mismatch
  hydrated: false,
  setLanguage: (lang) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("meelo-language", JSON.stringify(lang));
    }
    set({ language: lang });
  },
  hydrate: () => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("meelo-language");
      if (saved) {
        const parsed = JSON.parse(saved);
        const found = LANGUAGES.find((l) => l.code === parsed.code);
        if (found) {
          set({ language: found, hydrated: true });
          return;
        }
      }
    } catch {}
    set({ hydrated: true });
  },
}));
