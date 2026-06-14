"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguageStore, LANGUAGES, Language } from "@/stores/language-store";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "minimal" | "full";
  className?: string;
}

export function LanguageSelector({ variant = "full", className = "" }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredLanguages = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
    setSearch("");
  };

  if (variant === "minimal") {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] hover:bg-[#E2E2E2] dark:hover:bg-[#262626] text-[#000000] dark:text-[#FFFFFF] text-sm transition-colors border border-[#E2E2E2] dark:border-[#333333]"
        >
          <span className="text-base">{language.flag}</span>
          <span className="text-xs font-medium">{language.code.toUpperCase()}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 w-64 bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333] rounded-2xl shadow-xl overflow-hidden z-50">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-[#F6F6F6] dark:bg-[#262626] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors",
                    language.code === lang.code && "bg-[#F6F6F6] dark:bg-[#262626]"
                  )}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">{lang.name}</p>
                    <p className="text-xs text-[#6B6B6B]">{lang.nativeName}</p>
                  </div>
                  {language.code === lang.code && (
                    <Check className="h-4 w-4 text-[#06C167] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant — for profile/settings page
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
          <div>
            <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">Language</p>
            <p className="text-xs text-[#6B6B6B]">{language.flag} {language.name} ({language.nativeName})</p>
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-[#6B6B6B] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="mt-2 w-full bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333] rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="p-3">
            <input
              type="text"
              placeholder="Search language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-4 py-2.5 bg-[#F6F6F6] dark:bg-[#262626] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
            />
          </div>
          <div className="max-h-64 overflow-y-auto pb-2">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors",
                  language.code === lang.code && "bg-[#F6F6F6] dark:bg-[#262626]"
                )}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">{lang.name}</p>
                  <p className="text-xs text-[#6B6B6B]">{lang.nativeName}</p>
                </div>
                {language.code === lang.code && (
                  <Check className="h-4 w-4 text-[#06C167] shrink-0" />
                )}
              </button>
            ))}
            {filteredLanguages.length === 0 && (
              <p className="px-4 py-3 text-sm text-[#6B6B6B] text-center">No languages found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
