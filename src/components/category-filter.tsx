"use client";

import { ActivityCategory } from "@/types";
import { categoryEmojis, categoryLabels } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: ActivityCategory[];
  activeCategory: ActivityCategory | null;
  onSelect: (category: ActivityCategory | null) => void;
}

export function CategoryFilter({ categories, activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {/* "All" chip */}
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "uber-chip shrink-0",
          !activeCategory && "uber-chip-active"
        )}
      >
        <span>All</span>
      </button>

      {categories.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            onClick={() => onSelect(isActive ? null : category)}
            className={cn(
              "uber-chip shrink-0",
              isActive && "uber-chip-active"
            )}
          >
            <span className="text-sm">{categoryEmojis[category] || "✨"}</span>
            <span>{categoryLabels[category] || category}</span>
          </button>
        );
      })}
    </div>
  );
}
