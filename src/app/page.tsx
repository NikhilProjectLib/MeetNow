"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useActivityStore } from "@/stores/activity-store";
import { ActivityCard } from "@/components/activity-card";
import { CategoryFilter } from "@/components/category-filter";
import { ActivityMap } from "@/components/activity-map";
import { ActivityCategory } from "@/types";
import { ArrowRight, Clock, ChevronRight } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { getActivities, joinActivity, activities } = useActivityStore();
  const [activeCategory, setActiveCategory] = useState<ActivityCategory | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [locationQuery, setLocationQuery] = useState("");

  const dynamicCategories = useMemo(() => {
    const now = new Date();
    const futureActivities = activities.filter(
      (a) => new Date(`${a.date}T${a.time || "23:59"}`) >= now
    );
    const cats = new Set(futureActivities.map((a) => a.category));
    return Array.from(cats);
  }, [activities]);

  const filtered = getActivities(activeCategory ?? undefined);
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

  const handleJoin = (activityId: string) => {
    if (!currentUser) return;
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
      {/* ============================================
          HERO SECTION — Map as background, content floats
          ============================================ */}
      <div className="relative min-h-[520px] lg:min-h-[600px]">

        {/* MAP — Full background behind everything */}
        <div className="absolute inset-0 z-0">
          <ActivityMap
            activities={displayActivities}
            selectedId={selectedActivityId}
            onSelectActivity={handleMapSelect}
          />
          {/* Gradient fade from left so content is readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFFFFF] via-[#FFFFFF]/80 to-transparent dark:from-[#000000] dark:via-[#000000]/80 dark:to-transparent lg:w-[55%] pointer-events-none" />
          {/* Bottom fade for smooth transition to next section */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFFFFF] dark:from-[#000000] to-transparent pointer-events-none" />
          {/* Top subtle fade under navbar */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#FFFFFF]/50 dark:from-[#000000]/50 to-transparent pointer-events-none" />
        </div>

        {/* LEFT: Headline + Search + CTAs (floating over map) */}
        <div className="relative z-10 flex flex-col justify-center px-6 lg:px-14 xl:px-20 py-10 lg:py-16 max-w-xl">

          {/* Uber headline style: big, black, tight */}
          <h1 className="text-[2.5rem] lg:text-[3.5rem] font-black tracking-[-0.03em] leading-[1.05] text-[#000000] dark:text-[#FFFFFF]">
            Request an activity for now or later
          </h1>

          <p className="text-[#6B6B6B] text-[0.9375rem] mt-5 mb-8 max-w-md leading-relaxed">
            Discover sports, meetups, and events happening around you. Join or create your own.
          </p>

          {/* Uber input fields (pickup/dropoff style) */}
          <div className="flex flex-col gap-0 max-w-sm">
            {/* Pickup-style input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <div className="h-2 w-2 rounded-full bg-[#000000] dark:bg-[#FFFFFF]" />
              </div>
              <input
                type="text"
                placeholder="Search location or activity"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="uber-input rounded-t-lg rounded-b-none border-b border-[#E2E2E2] dark:border-[#333333]"
              />
            </div>

            {/* Dropoff-style input */}
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

            {/* CTA Buttons — Uber black pills */}
            <div className="flex gap-3 mt-5">
              <Link href="/create" className="uber-btn flex-1">
                Create Activity
              </Link>
              <Link href="/explore" className="uber-btn uber-btn-secondary">
                Explore
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Live counter with Uber green */}
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
                <span>
                  <strong className="text-[#000000] dark:text-[#FFFFFF]">{startingSoon.length}</strong> starting soon
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================
          SUB-NAV: Category filter (like Uber's
          "Request a ride | Reserve a ride | See prices")
          ============================================ */}
      <div className="px-6 lg:px-14 xl:px-20 py-4 border-y border-[#E2E2E2] dark:border-[#333333] bg-[#FFFFFF] dark:bg-[#000000] sticky top-16 z-20">
        <CategoryFilter
          categories={dynamicCategories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </div>

      {/* ============================================
          ACTIVITY CARDS SECTION
          Like Uber's "Suggestions" product cards
          ============================================ */}
      <div className="px-6 lg:px-14 xl:px-20 py-10 bg-[#FFFFFF] dark:bg-[#000000]">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#000000] dark:text-[#FFFFFF]">
              {activeCategory
                ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)
                : "Suggestions"}
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1">
              {displayActivities.length} activit{displayActivities.length === 1 ? "y" : "ies"} near you
            </p>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1 text-sm font-medium text-[#000000] dark:text-[#FFFFFF] hover:underline underline-offset-4"
          >
            See all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Starting Soon */}
        {startingSoon.length > 0 && !activeCategory && (
          <div className="mb-8 p-5 rounded-xl bg-[#FFF8E1] dark:bg-[#1A1500] border border-[#FFE082] dark:border-[#4A3D00]">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-[#F9A825]" />
              <span className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">Starting Soon</span>
              <span className="text-xs bg-[#FFE082] dark:bg-[#4A3D00] text-[#000000] dark:text-[#FFE082] px-2 py-0.5 rounded-full font-medium">
                {startingSoon.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {startingSoon.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  id={`activity-${activity.id}`}
                  className={cn(
                    "transition-all rounded-xl",
                    selectedActivityId === activity.id && "ring-2 ring-[#000000] dark:ring-[#FFFFFF] ring-offset-2"
                  )}
                  onClick={() => setSelectedActivityId(activity.id)}
                >
                  <ActivityCard activity={activity} variant="join" onAction={handleJoin} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main grid */}
        {displayActivities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayActivities
              .filter((a) => !startingSoon.includes(a) || activeCategory)
              .map((activity) => (
                <div
                  key={activity.id}
                  id={`activity-${activity.id}`}
                  className={cn(
                    "transition-all rounded-xl fade-in-up",
                    selectedActivityId === activity.id && "ring-2 ring-[#000000] dark:ring-[#FFFFFF] ring-offset-2"
                  )}
                  onClick={() => setSelectedActivityId(activity.id)}
                >
                  <ActivityCard activity={activity} variant="join" onAction={handleJoin} />
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-5">🏃</div>
            <p className="text-xl font-bold text-[#000000] dark:text-[#FFFFFF] mb-2">No activities yet</p>
            <p className="text-sm text-[#6B6B6B] mb-6 max-w-sm mx-auto">
              Be the first to create an activity in your area
            </p>
            <Link href="/create" className="uber-btn inline-flex">
              Create Activity
            </Link>
          </div>
        )}

        {/* Bottom CTA */}
        {displayActivities.length > 3 && (
          <div className="mt-12 pt-8 border-t border-[#E2E2E2] dark:border-[#333333] text-center">
            <p className="text-sm text-[#6B6B6B] mb-4">Don&apos;t see what you&apos;re looking for?</p>
            <Link href="/create" className="uber-btn inline-flex">
              Create Your Own Activity
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
