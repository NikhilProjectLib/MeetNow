import { en } from "./en";
import { hi } from "./hi";
import { es } from "./es";
import { fr } from "./fr";
import { ar } from "./ar";
import { pt } from "./pt";
import { ru } from "./ru";
import { ja } from "./ja";
import { de } from "./de";
import { zh } from "./zh";
import { ko } from "./ko";
import { it } from "./it";
import { tr } from "./tr";
import { id } from "./id";
import { th } from "./th";

export type TranslationKeys = keyof typeof en;
export type Translations = Record<TranslationKeys, string>;

const translations: Record<string, Translations> = {
  en,
  hi,
  es,
  fr,
  ar,
  pt,
  ru,
  ja,
  de,
  zh,
  ko,
  it,
  tr,
  id,
  th,
};

export function getTranslations(langCode: string): Translations {
  return translations[langCode] || en;
}
