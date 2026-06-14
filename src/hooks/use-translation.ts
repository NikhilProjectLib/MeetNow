"use client";

import { useEffect } from "react";
import { useLanguageStore } from "@/stores/language-store";
import { getTranslations, TranslationKeys } from "@/lib/translations";

export function useTranslation() {
  const { language, hydrated, hydrate } = useLanguageStore();

  // Hydrate language from localStorage on first client render
  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrated, hydrate]);

  const t = getTranslations(language.code);

  return {
    t,
    lang: language.code,
    get: (key: TranslationKeys) => t[key] || key,
  };
}
