"use client";

import { ActivityCategory } from "@/types";
import { categoryEmojis, categoryLabels } from "@/lib/mock-data";
import { getCategoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: ActivityCategory[];
  activeCategory: ActivityCategory | null;
  onSelect: (category: ActivityCategory | null) => void;
}

export function CategoryFilter({ categories, activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((category) => {
        const isActive = activeCategory === category;
        const colors = getCategoryColor(category);
        return (
          <button
            key={category}
            onClick={() => onSelect(isActive ? null : category)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all border",
              isActive
                ? cn(colors.bg, "text-white border-transparent shadow-md")
                : cn("bg-background border-border hover:border-primary/30", colors.text)
            )}
          >
            <span className="text-base">{categoryEmojis[category] || "\u2728"}</span>
            <span>{categoryLabels[category] || category}</span>
          </button>
        );
      })}
    </div>
  );
}
