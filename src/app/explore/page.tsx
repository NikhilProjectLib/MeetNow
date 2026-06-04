"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActivityStore } from "@/stores/activity-store";
import { ActivityCard } from "@/components/activity-card";
import { CategoryFilter } from "@/components/category-filter";
import { DistanceFilter } from "@/components/distance-filter";
import { ActivityCategory } from "@/types";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { mockUser } from "@/lib/mock-data";

export default function ExplorePage() {
  const { getNearbyActivities, activities, userLocation } = useActivityStore();
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Derive categories dynamically
  const dynamicCategories = useMemo(() => {
    const cats = new Set(activities.map((a) => a.category));
    return Array.from(cats);
  }, [activities]);

  let filtered = getNearbyActivities(activeCategory ?? undefined).filter(
    (a) => !a.players.some((p) => p.id === mockUser.id)
  );

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.location.toLowerCase().includes(query)
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Explore Nearby</h1>
        <p className="text-muted-foreground mt-1">Discover activities around you</p>
      </div>

      {/* Distance Radius Filter */}
      <DistanceFilter />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search activities or locations..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      <CategoryFilter
        categories={dynamicCategories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filtered.length} activities found
        </p>
        {userLocation && (
          <p className="text-xs text-muted-foreground">
            📍 Location active
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No activities within this range.</p>
          <p className="text-sm mt-1">Try increasing the distance or changing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
