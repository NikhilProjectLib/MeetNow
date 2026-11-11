"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActivityStore } from "@/stores/activity-store";
import { ActivityCard } from "@/components/activity-card";
import { CategoryFilter } from "@/components/category-filter";
import { DistanceFilter } from "@/components/distance-filter";
import { ActivityMap } from "@/components/activity-map";
import { ActivityCategory } from "@/types";
import { ArrowRight, Clock, ChevronRight, ChevronLeft } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUnreadCounts } from "@/hooks/use-unread-counts";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { AdBanner } from "@/components/ad-banner";
import { loginUrl } from "@/lib/auth-redirect";

const ITEMS_PER_PAGE = 6;

export default function HomePage() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { getActivities, getNearbyActivities, joinActivity, activities } = useActivityStore();
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const unreadCounts = useUnreadCounts();

  const dynamicCategories = useMemo(() => {
    const now = new Date();
    const futureActivities = activities.filter(
      (a) => new Date(`${a.date}T${a.time || "23:59"}`) >= now
    );
    const cats = new Set(futureActivities.map((a) => a.category));
    return Array.from(cats);
  }, [activities]);

  const filtered = getNearbyActivities(activeCategory ?? undefined);
  const now = new Date();

  const upcomingActivities = filtered.filter((a) => {
    return new Date(`${a.date}T${a.time || "23:59"}`) >= now;
  });

  const startingSoon = upcomingActivities.filter((a) => {
    const diff = new Date(`${a.date}T${a.time}`).getTime() - now.getTime();
    return diff > 0 && diff <= 3 * 60 * 60 * 1000;
  });

  const displayActivities = useMemo(() => {
    if (!locationQuery.trim()) return upcomingActivities;
    const q = locationQuery.toLowerCase();
    return upcomingActivities.filter(
      (a) => a.location.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
    );
  }, [upcomingActivities, locationQuery]);

  // Dropdown search results (top 5 matches)
  const searchResults = useMemo(() => {
    if (!locationQuery.trim()) return [];
    const q = locationQuery.toLowerCase();
    return upcomingActivities
      .filter((a) => a.location.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [upcomingActivities, locationQuery]);

  // Pagination
  const totalPages = Math.ceil(displayActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = displayActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useMemo(() => { setCurrentPage(1); }, [activeCategory, locationQuery]);

  const handleJoin = (activityId: string) => {
    if (!currentUser) {
      // Guests can browse freely; ask them to log in only when they join.
      router.push(loginUrl(`/activity/${activityId}`));
      return;
    }
    joinActivity(activityId, {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
    });
    const activity = activities.find((a) => a.id === activityId);
    toast.success("You're in!", { description: activity?.name || "Activity joined" });
  };

  const handleMapSelect = (id: string) => {
    setSelectedActivityId(id);
    const el = document.getElementById(`activity-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="flex flex-col">
      {/* HERO: Full-screen map background with content overlay */}
      <div className="relative min-h-[500px] lg:min-h-[580px]">
        {/* MAP — Full background */}
        <div className="absolute inset-0 z-0">
          <ActivityMap
            activities={displayActivities}
            selectedId={selectedActivityId}
            onSelectActivity={handleMapSelect}
          />
        </div>

        {/* Content overlay on left with gradient fade */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF]/70 to-transparent dark:from-[#000000] dark:via-[#000000]/70 dark:to-transparent" />

        {/* LEFT: Headline + Search + CTAs */}
        <div className="relative z-20 flex flex-col justify-center px-6 lg:px-14 xl:px-20 py-10 lg:py-16 max-w-xl min-h-[500px] lg:min-h-[580px]">
          <h1 className="text-[2.5rem] lg:text-[3.5rem] font-black tracking-[-0.03em] leading-[1.05] text-[#000000] dark:text-[#FFFFFF]">
            Request an activity for now or later
          </h1>
          <p className="text-[#6B6B6B] text-[0.9375rem] mt-5 mb-8 max-w-md leading-relaxed">
            Discover sports, meetups, and events happening around you. Join or create your own.
          </p>

          <div className="flex flex-col gap-0 max-w-sm">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <div className="h-2 w-2 rounded-full bg-[#000000] dark:bg-[#FFFFFF]" />
              </div>
              <input
                type="text"
                placeholder="Search activity"
                value={locationQuery}
                onChange={(e) => { setLocationQuery(e.target.value); setShowSearchDropdown(true); }}
                onFocus={() => { if (locationQuery.trim()) setShowSearchDropdown(true); }}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                className="uber-input rounded-t-lg rounded-b-none border-b border-[#E2E2E2] dark:border-[#333333]"
              />

              {/* Search dropdown — Google-style suggestions */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333] rounded-b-xl shadow-lg overflow-hidden">
                  {searchResults.map((activity) => (
                    <button
                      key={activity.id}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors text-left"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        router.push(`/activity/${activity.id}`);
                        setShowSearchDropdown(false);
                      }}
                    >
                      <div className="h-9 w-9 rounded-lg bg-[#F6F6F6] dark:bg-[#333333] flex items-center justify-center text-lg shrink-0">
                        {activity.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF] truncate">{activity.name}</p>
                        <p className="text-xs text-[#6B6B6B] truncate">{activity.location} · {activity.time}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-[#6B6B6B] shrink-0" />
                    </button>
                  ))}
                  <div className="px-4 py-2 border-t border-[#E2E2E2] dark:border-[#333333] bg-[#F6F6F6] dark:bg-[#1A1A1A]">
                    <p className="text-[11px] text-[#6B6B6B]">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found</p>
                  </div>
                </div>
              )}

              {/* No results message */}
              {showSearchDropdown && locationQuery.trim() && searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333] rounded-b-xl shadow-lg px-4 py-4 text-center">
                  <p className="text-sm text-[#6B6B6B]">No activities match &quot;{locationQuery}&quot;</p>
                  <button
                    onMouseDown={(e) => { e.preventDefault(); router.push("/create"); }}
                    className="text-xs text-[#000000] dark:text-[#FFFFFF] font-medium hover:underline mt-1"
                  >
                    Create one →
                  </button>
                </div>
              )}
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <div className="h-2 w-2 bg-[#6B6B6B]" />
              </div>
              <div
                className="w-full pl-10 pr-4 py-4 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-b-lg text-[0.875rem] text-[#6B6B6B] cursor-pointer hover:bg-[#EEEEEE] dark:hover:bg-[#333333] transition-colors"
                onClick={() => router.push("/explore")}
              >
                Browse all categories →
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Link href="/create" className="uber-btn flex-1">Create Activity</Link>
              <Link href="/explore" className="uber-btn uber-btn-secondary">
                Explore <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-5 mt-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="uber-green-dot live-dot" />
              <span className="text-[#000000] dark:text-[#FFFFFF]">
                <strong>{upcomingActivities.length}</strong>
                <span className="text-[#6B6B6B] ml-1">live now</span>
              </span>
            </div>
            {startingSoon.length > 0 && (
              <div className="flex items-center gap-2 text-[#6B6B6B]">
                <Clock className="h-3.5 w-3.5" />
                <strong className="text-[#000000] dark:text-[#FFFFFF]">{startingSoon.length}</strong> starting soon
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter + Distance */}
      <div className="px-6 lg:px-14 xl:px-20 py-4 border-y border-[#E2E2E2] dark:border-[#333333] bg-[#FFFFFF] dark:bg-[#000000] sticky top-16 z-20">
        <div className="flex flex-col gap-3">
          <CategoryFilter
            categories={dynamicCategories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
          <DistanceFilter />
        </div>
      </div>

      {/* Ad Banner - between filters and cards */}
      <div className="px-6 lg:px-14 xl:px-20 py-4 bg-[#FFFFFF] dark:bg-[#000000]">
        <AdBanner slot="1234567890" format="horizontal" className="rounded-xl overflow-hidden" />
      </div>

      {/* Activity Cards with Pagination */}
      <div className="px-6 lg:px-14 xl:px-20 py-10 bg-[#FFFFFF] dark:bg-[#000000]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#000000] dark:text-[#FFFFFF]">
              {activeCategory ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) : "Suggestions"}
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1">
              {displayActivities.length} activit{displayActivities.length === 1 ? "y" : "ies"} near you
            </p>
          </div>
          <Link href="/explore" className="flex items-center gap-1 text-sm font-medium text-[#000000] dark:text-[#FFFFFF] hover:underline underline-offset-4">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Cards */}
        {paginatedActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {paginatedActivities.map((activity) => (
              <div
                key={activity.id}
                id={`activity-${activity.id}`}
                className={cn(
                  "transition-all",
                  selectedActivityId === activity.id && "ring-2 ring-[#000000] dark:ring-[#FFFFFF] ring-offset-2 rounded-2xl"
                )}
                onClick={() => setSelectedActivityId(activity.id)}
              >
                <ActivityCard activity={activity} variant="join" onAction={handleJoin} unreadCount={unreadCounts[activity.id] || 0} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-5">🏃</div>
            <p className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">No activities yet</p>
            <p className="text-sm text-[#6B6B6B] mb-6">Be the first to create an activity in your area</p>
            <Link href="/create" className="uber-btn inline-flex">Create Activity</Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-[#E2E2E2] dark:border-[#333333]">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-10 w-10 rounded-full flex items-center justify-center bg-[#F6F6F6] dark:bg-[#1A1A1A] disabled:opacity-30 hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentPage === page
                    ? "bg-[#000000] text-[#FFFFFF] dark:bg-[#FFFFFF] dark:text-[#000000]"
                    : "bg-[#F6F6F6] dark:bg-[#1A1A1A] text-[#6B6B6B] hover:bg-[#E2E2E2] dark:hover:bg-[#333333]"
                )}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-10 w-10 rounded-full flex items-center justify-center bg-[#F6F6F6] dark:bg-[#1A1A1A] disabled:opacity-30 hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom Ad Banner */}
        <div className="mt-8">
          <AdBanner slot="0987654321" format="rectangle" className="rounded-xl overflow-hidden" />
        </div>
      </div>
    </div>
  );
}
