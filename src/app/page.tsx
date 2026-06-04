"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActivityStore } from "@/stores/activity-store";
import { ActivityCard } from "@/components/activity-card";
import { CategoryFilter } from "@/components/category-filter";
import { ActivityCategory } from "@/types";
import { Flame, MapPin, Sparkles } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function HomePage() {
  const currentUser = useCurrentUser();
  const { getActivities, joinActivity, activities } = useActivityStore();
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | null>(null);
  const router = useRouter();

  // Derive categories dynamically
  const dynamicCategories = useMemo(() => {
    const now = new Date();
    const futureActivities = activities.filter(
      (a) => new Date(`${a.date}T${a.time || "23:59"}`) >= now
    );
    const cats = new Set(futureActivities.map((a) => a.category));
    return Array.from(cats);
  }, [activities]);

  const filtered = getActivities(activeCategory ?? undefined);

  // Separate "starting soon" activities
  const now = new Date();
  const startingSoon = filtered.filter((a) => {
    const diff = new Date(`${a.date}T${a.time}`).getTime() - now.getTime();
    return diff > 0 && diff <= 3 * 60 * 60 * 1000; // within 3 hours
  });
  const others = filtered.filter((a) => {
    const diff = new Date(`${a.date}T${a.time}`).getTime() - now.getTime();
    return diff > 3 * 60 * 60 * 1000;
  });

  const handleJoin = (activityId: string) => {
    if (!currentUser) return;
    joinActivity(activityId, {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-3xl font-bold mt-0.5">
            {(currentUser?.name || "User").split(" ")[0]} <span className="text-2xl">{"👋"}</span>
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Nearby activities
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium bg-primary/10 text-primary px-4 py-2 rounded-xl">
          <Sparkles className="h-4 w-4" />
          <span>{filtered.length} live</span>
        </div>
      </div>

      {/* Category Filters */}
      <CategoryFilter
        categories={dynamicCategories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
      />

      {/* Starting Soon Section */}
      {startingSoon.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-red-600 flex items-center gap-1.5 mb-3">
            <Flame className="h-4 w-4" />
            Starting Soon
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {startingSoon.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                variant="join"
                onAction={handleJoin}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Activities */}
      {others.length > 0 && (
        <div>
          {startingSoon.length > 0 && (
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              Upcoming Activities
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {others.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                variant="join"
                onAction={handleJoin}
              />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">{"🔍"}</p>
          <p className="text-lg font-medium">No activities found</p>
          <p className="text-sm mt-1">Try a different category or check back later!</p>
        </div>
      )}
    </div>
  );
}
