"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useActivityStore } from "@/stores/activity-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUnreadCounts } from "@/hooks/use-unread-counts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users, Ticket, LogOut } from "lucide-react";

type Tab = "upcoming" | "history" | "created";

export default function MyActivitiesPage() {
  const currentUser = useCurrentUser();
  const { activities, leaveActivity } = useActivityStore();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const unreadCounts = useUnreadCounts();

  const now = new Date();

  const joinedActivities = useMemo(() => {
    if (!currentUser) return [];
    return activities.filter((a) => a.players.some((p) => p.id === currentUser.id));
  }, [activities, currentUser]);

  const createdActivities = useMemo(() => {
    if (!currentUser) return [];
    return activities.filter((a) => a.createdBy === currentUser.id);
  }, [activities, currentUser]);

  const upcoming = useMemo(() => {
    return joinedActivities
      .filter((a) => new Date(`${a.date}T${a.time || "23:59"}`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time || "00:00"}`).getTime() - new Date(`${b.date}T${b.time || "00:00"}`).getTime());
  }, [joinedActivities]);

  const history = useMemo(() => {
    return joinedActivities
      .filter((a) => new Date(`${a.date}T${a.time || "23:59"}`) < now)
      .sort((a, b) => new Date(`${b.date}T${b.time || "00:00"}`).getTime() - new Date(`${a.date}T${a.time || "00:00"}`).getTime());
  }, [joinedActivities]);

  const getDisplayList = () => {
    switch (activeTab) {
      case "upcoming": return upcoming;
      case "history": return history;
      case "created": return createdActivities;
    }
  };

  const displayList = getDisplayList();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
    if (target.getTime() === today.getTime()) return "Today";
    if (target.getTime() === tomorrow.getTime()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const tabs = [
    { id: "upcoming" as Tab, label: "Upcoming", count: upcoming.length },
    { id: "history" as Tab, label: "History", count: history.length },
    { id: "created" as Tab, label: "Created", count: createdActivities.length },
  ];

  return (
    <div className="flex flex-col gap-6 px-6 lg:px-14 xl:px-20 py-8 bg-[#FFFFFF] dark:bg-[#000000] min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-[#000000] dark:text-[#FFFFFF]">My Activities</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">Track your joined and created activities</p>
      </div>

      {/* Stats */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">{upcoming.length}</span>
          <span className="text-sm text-[#6B6B6B]">Upcoming</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">{history.length}</span>
          <span className="text-sm text-[#6B6B6B]">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">{createdActivities.length}</span>
          <span className="text-sm text-[#6B6B6B]">Created</span>
        </div>
      </div>

      {/* Tabs — Uber chip style */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "uber-chip",
              activeTab === tab.id && "uber-chip-active"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "text-[11px] px-1.5 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-[#FFFFFF]/20 dark:bg-[#000000]/20" : "bg-[#E2E2E2] dark:bg-[#333333]"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Activity List */}
      {displayList.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">
            {activeTab === "upcoming" ? "📅" : activeTab === "history" ? "📜" : "✨"}
          </div>
          <p className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">
            {activeTab === "upcoming" && "No upcoming activities"}
            {activeTab === "history" && "No past activities yet"}
            {activeTab === "created" && "No activities created"}
          </p>
          <p className="text-sm text-[#6B6B6B] mt-1 mb-5">
            {activeTab === "upcoming" && "Join an activity from Home or Explore!"}
            {activeTab === "history" && "Your completed activities will appear here."}
            {activeTab === "created" && "Create your first activity to get started!"}
          </p>
          {activeTab === "created" && (
            <Link href="/create" className="uber-btn inline-flex">Create Activity</Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayList.map((activity) => {
            const player = activity.players.find((p) => p.id === currentUser?.id);
            const isPast = new Date(`${activity.date}T${activity.time || "23:59"}`) < now;

            return (
              <Link
                key={activity.id}
                href={`/activity/${activity.id}`}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A] hover:bg-[#EEEEEE] dark:hover:bg-[#262626] transition-colors",
                  isPast && "opacity-60"
                )}
              >
                {/* Emoji */}
                <div className="h-12 w-12 rounded-xl bg-[#FFFFFF] dark:bg-[#000000] flex items-center justify-center text-2xl shrink-0">
                  {activity.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[0.9375rem] text-[#000000] dark:text-[#FFFFFF] truncate">{activity.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[13px] text-[#6B6B6B]">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(activity.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{activity.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{activity.location}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{activity.playersJoined}/{activity.playersNeeded}</span>
                  </div>
                  {unreadCounts[activity.id] > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#06C167] animate-pulse" />
                      <span className="text-[11px] font-medium text-[#06C167]">New messages</span>
                    </div>
                  )}
                  {player?.ticketId && (
                    <span className="flex items-center gap-1 mt-1 text-[11px] text-[#6B6B6B] font-mono">
                      <Ticket className="h-3 w-3" />{player.ticketId}
                    </span>
                  )}
                </div>

                {/* Right: Status + actions */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {isPast ? (
                    <span className="text-[11px] font-medium text-[#6B6B6B] bg-[#E2E2E2] dark:bg-[#333333] px-2.5 py-1 rounded-full">Done</span>
                  ) : (
                    <span className="text-[11px] font-medium text-[#06C167] bg-[#E6F9EF] dark:bg-[#001A0D] px-2.5 py-1 rounded-full">Active</span>
                  )}
                  {!isPast && activeTab !== "created" && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (currentUser) leaveActivity(activity.id, currentUser.id);
                      }}
                      className="flex items-center gap-1 text-[11px] text-[#E11900] hover:underline mt-1"
                    >
                      <LogOut className="h-3 w-3" />Leave
                    </button>
                  )}
                  {activeTab === "created" && (
                    <span className="text-[11px] text-[#6B6B6B]">Organizer</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
