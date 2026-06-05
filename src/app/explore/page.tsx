"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActivityStore } from "@/stores/activity-store";
import { ActivityCard } from "@/components/activity-card";
import { CategoryFilter } from "@/components/category-filter";
import { DistanceFilter } from "@/components/distance-filter";
import { ActivityCategory } from "@/types";
import { Search, MapPin } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function ExplorePage() {
  const { getNearbyActivities, activities, userLocation } = useActivityStore();
  const currentUser = useCurrentUser();
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const dynamicCategories = useMemo(() => {
    const cats = new Set(activities.map((a) => a.category));
    return Array.from(cats);
  }, [activities]);

  let filtered = getNearbyActivities(activeCategory ?? undefined).filter(
    (a) => !currentUser || !a.players.some((p) => p.id === currentUser.id)
  );

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (a) => a.name.toLowerCase().includes(query) || a.location.toLowerCase().includes(query)
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 lg:px-14 xl:px-20 py-8 bg-[#FFFFFF] dark:bg-[#000000] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#000000] dark:text-[#FFFFFF]">Explore</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">Discover activities around you</p>
      </div>

      {/* Distance Filter */}
      <DistanceFilter />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
        <input
          type="text"
          placeholder="Search activities or locations..."
          className="w-full pl-10 pr-4 py-3 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-full text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Chips */}
      <CategoryFilter
        categories={dynamicCategories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6B6B6B]">{filtered.length} activities found</p>
        {userLocation && (
          <p className="flex items-center gap-1 text-xs text-[#06C167] font-medium">
            <MapPin className="h-3 w-3" /> Location active
          </p>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">No activities in range</p>
          <p className="text-sm text-[#6B6B6B] mt-1">Try increasing the distance or changing filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              variant="view"
              onAction={(id) => router.push(`/activity/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
