"use client";

import { useState, useMemo, useRef } from "react";
import { useActivityStore } from "@/stores/activity-store";
import { ActivityCard } from "@/components/activity-card";
import { CategoryFilter } from "@/components/category-filter";
import { ActivityMap } from "@/components/activity-map";
import { ActivityCategory } from "@/types";
import { Flame, Sparkles, Map, List } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const currentUser = useCurrentUser();
  const { getActivities, joinActivity, activities } = useActivityStore();
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split");
  const listRef = useRef<HTMLDivElement>(null);

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
    return diff > 0 && diff <= 3 * 60 * 60 * 1000;
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

  const handleMapSelect = (id: string) => {
    setSelectedActivityId(id);
    // Scroll the list to the selected activity
    const el = document.getElementById(`activity-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-64px)]">
      {/* Top bar: filters + view toggle */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Activities</h1>
          <div className="flex items-center gap-1 text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-lg">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{filtered.length} live</span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg">
          <button
            onClick={() => setViewMode("split")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === "split" ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === "map" ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
          >
            <Map className="h-3.5 w-3.5" />
            Map
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
              viewMode === "list" ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="shrink-0">
        <CategoryFilter
          categories={dynamicCategories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      {/* Main content area */}
      <div className={cn(
        "flex-1 min-h-0",
        viewMode === "split" && "grid grid-rows-2 gap-4",
        viewMode === "map" && "grid grid-rows-1",
        viewMode === "list" && "grid grid-rows-1"
      )}>
        {/* Map section */}
        {(viewMode === "split" || viewMode === "map") && (
          <div className={cn(
            "min-h-0",
            viewMode === "map" && "h-full"
          )}>
            <ActivityMap
              activities={filtered}
              selectedId={selectedActivityId}
              onSelectActivity={handleMapSelect}
            />
          </div>
        )}

        {/* List section */}
        {(viewMode === "split" || viewMode === "list") && (
          <div ref={listRef} className="overflow-y-auto min-h-0 pr-1">
            {/* Starting Soon */}
            {startingSoon.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mb-2 sticky top-0 bg-background py-1 z-10">
                  <Flame className="h-3.5 w-3.5" />
                  Starting Soon
                </h2>
                <div className={cn(
                  "gap-3",
                  viewMode === "list" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col"
                )}>
                  {startingSoon.map((activity) => (
                    <div
                      key={activity.id}
                      id={`activity-${activity.id}`}
                      className={cn(
                        "transition-all rounded-xl",
                        selectedActivityId === activity.id && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => setSelectedActivityId(activity.id)}
                    >
                      <ActivityCard activity={activity} variant="join" onAction={handleJoin} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {others.length > 0 && (
              <div>
                {startingSoon.length > 0 && (
                  <h2 className="text-xs font-semibold text-muted-foreground mb-2 sticky top-0 bg-background py-1 z-10">
                    Upcoming
                  </h2>
                )}
                <div className={cn(
                  "gap-3",
                  viewMode === "list" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col"
                )}>
                  {others.map((activity) => (
                    <div
                      key={activity.id}
                      id={`activity-${activity.id}`}
                      className={cn(
                        "transition-all rounded-xl",
                        selectedActivityId === activity.id && "ring-2 ring-primary ring-offset-2"
                      )}
                      onClick={() => setSelectedActivityId(activity.id)}
                    >
                      <ActivityCard activity={activity} variant="join" onAction={handleJoin} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-medium">No activities found</p>
                <p className="text-sm mt-1">Try a different category or check back later!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
