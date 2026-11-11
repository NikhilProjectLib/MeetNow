"use client";

import { useState } from "react";
import { Activity } from "@/types";
import { MapPin, Clock, Users, Check } from "lucide-react";
import { categoryLabels, categoryEmojis } from "@/lib/mock-data";
import { getUrgencyInfo } from "@/lib/category-colors";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface ActivityCardProps {
  activity: Activity;
  variant: "join" | "view";
  onAction: (activityId: string) => void;
  unreadCount?: number;
}

export function ActivityCard({ activity, variant, onAction, unreadCount = 0 }: ActivityCardProps) {
  const currentUser = useCurrentUser();
  const [justJoined, setJustJoined] = useState(false);
  const isFull = activity.playersJoined >= activity.playersNeeded;
  const isAlreadyJoined = currentUser ? activity.players.some((p) => p.id === currentUser.id) : false;
  const capacityPercent = Math.round((activity.playersJoined / activity.playersNeeded) * 100);
  const urgency = getUrgencyInfo(activity.date, activity.time);
  const isStartingSoon = urgency && (urgency.label.includes("soon") || (urgency.label.includes("In ") && !urgency.label.includes("day")));

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAction(activity.id);
    if (!currentUser) return; // guest → parent redirects to login
    setJustJoined(true);

    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({
      particleCount: 50,
      spread: 40,
      origin: { x, y },
      colors: ["#000000", "#06C167", "#FFB800", "#276EF1"],
      ticks: 70,
      gravity: 1.2,
      scalar: 0.8,
    });
  };

  // Emoji as "image" for the card (like Uber's product images)
  const emojiChar = activity.emoji || categoryEmojis[activity.category] || "🎯";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Uber product-suggestion-tile style */}
      <Link
        href={`/activity/${activity.id}`}
        className={cn(
          "group flex items-center gap-4 p-4 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A] hover:bg-[#EEEEEE] dark:hover:bg-[#262626] transition-colors cursor-pointer",
          isStartingSoon && "ring-1 ring-[#FFB800]"
        )}
      >
        {/* Text content (left side) */}
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF] leading-tight line-clamp-1">
              {activity.name}
            </span>
            {isStartingSoon && (
              <span className="h-1.5 w-1.5 rounded-full bg-[#F9A825] live-dot shrink-0" />
            )}
          </div>

          {/* Description / meta */}
          <p className="text-[0.8125rem] text-[#6B6B6B] leading-snug line-clamp-2">
            {activity.location} · {activity.time}
            {activity.distance && activity.distance !== "0 km" ? ` · ${activity.distance}` : ""}
            {urgency ? ` · ${urgency.label}` : ""}
          </p>

          {/* Capacity + players row */}
          <div className="flex items-center gap-3 mt-1">
            {/* Thin progress bar */}
            <div className="w-16 h-[4px] bg-[#E2E2E2] dark:bg-[#333333] rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isFull
                    ? "bg-[#E11900]"
                    : capacityPercent > 75
                    ? "bg-[#FFB800]"
                    : "bg-[#000000] dark:bg-[#FFFFFF]"
                )}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-[#6B6B6B] font-medium">
              {activity.playersJoined}/{activity.playersNeeded}
            </span>

            {/* Player avatars */}
            {activity.players.length > 0 && (
              <div className="flex -space-x-1.5 ml-1">
                {activity.players.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="h-5 w-5 rounded-full bg-[#E2E2E2] dark:bg-[#333333] border border-[#F6F6F6] dark:border-[#1A1A1A] flex items-center justify-center text-[8px] font-bold text-[#000000] dark:text-[#FFFFFF]"
                  >
                    {p.name[0]}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Unread chat indicator */}
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#E6F9EF] dark:bg-[#001A0D]">
              <span className="h-2 w-2 rounded-full bg-[#06C167] animate-pulse shrink-0" />
              <span className="text-xs font-medium text-[#06C167]">New messages in chat</span>
            </div>
          )}

          {/* Action button — Uber "Details" style */}
          <div className="mt-2">
            {variant === "join" ? (
              isFull ? (
                <span className="inline-flex items-center text-[0.8125rem] font-medium text-[#E11900]">
                  Full
                </span>
              ) : justJoined || isAlreadyJoined ? (
                <motion.span
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-[#06C167]"
                >
                  <Check className="h-3.5 w-3.5" />
                  Joined
                </motion.span>
              ) : (
                <button
                  onClick={handleJoin}
                  className="inline-flex items-center px-4 py-1.5 bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] rounded-full text-[0.8125rem] font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#000000] hover:text-[#FFFFFF] dark:hover:bg-[#FFFFFF] dark:hover:text-[#000000] transition-colors"
                >
                  Join
                </button>
              )
            ) : (
              <span className="inline-flex items-center px-4 py-1.5 bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] rounded-full text-[0.8125rem] font-medium text-[#000000] dark:text-[#FFFFFF] group-hover:bg-[#000000] group-hover:text-[#FFFFFF] dark:group-hover:bg-[#FFFFFF] dark:group-hover:text-[#000000] transition-colors">
                Details
              </span>
            )}
          </div>
        </div>

        {/* Right side image/emoji (like Uber's product illustration) */}
        <div className="shrink-0 h-[116px] w-[116px] rounded-xl bg-[#FFFFFF] dark:bg-[#000000] flex items-center justify-center text-5xl shadow-sm">
          {emojiChar}
        </div>
      </Link>
    </motion.div>
  );
}
