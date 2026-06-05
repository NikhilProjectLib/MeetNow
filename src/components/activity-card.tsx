"use client";

import { useState } from "react";
import { Activity } from "@/types";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Check } from "lucide-react";
import { categoryLabels } from "@/lib/mock-data";
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
}

export function ActivityCard({ activity, variant, onAction }: ActivityCardProps) {
  const currentUser = useCurrentUser();
  const [justJoined, setJustJoined] = useState(false);
  const isFull = activity.playersJoined >= activity.playersNeeded;
  const isAlreadyJoined = currentUser ? activity.players.some((p) => p.id === currentUser.id) : false;
  const capacityPercent = Math.round((activity.playersJoined / activity.playersNeeded) * 100);
  const urgency = getUrgencyInfo(activity.date, activity.time);
  const isStartingSoon = urgency && (urgency.label.includes("soon") || (urgency.label.includes("In ") && !urgency.label.includes("day")));

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAction(activity.id);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(isStartingSoon && "starting-soon-pulse")}
    >
      <div className={cn(
        "uber-card p-5 flex flex-col gap-3.5 cursor-pointer",
        isStartingSoon && "ring-1 ring-[#FFB800]"
      )}>
        {/* Header: emoji + title + time badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-xl shrink-0">
              {activity.emoji}
            </div>
            <div className="min-w-0">
              <Link
                href={`/activity/${activity.id}`}
                className="font-semibold text-[0.9375rem] text-[#000000] dark:text-[#FFFFFF] hover:underline underline-offset-2 line-clamp-1 block"
              >
                {activity.name}
              </Link>
              <span className="text-xs text-[#6B6B6B]">
                {categoryLabels[activity.category] || activity.category}
              </span>
            </div>
          </div>

          {urgency && (
            <span className={cn(
              "text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5 shrink-0",
              isStartingSoon
                ? "bg-[#FFF8E1] text-[#F9A825] dark:bg-[#2A2000] dark:text-[#FFB800]"
                : "bg-[#F6F6F6] text-[#6B6B6B] dark:bg-[#1A1A1A]"
            )}>
              {isStartingSoon && <span className="h-1.5 w-1.5 rounded-full bg-[#F9A825] live-dot" />}
              {urgency.label}
            </span>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-[#6B6B6B]">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[160px]">{activity.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {activity.time}
          </span>
          {activity.distance && activity.distance !== "0 km" && (
            <span className="text-xs">{activity.distance}</span>
          )}
        </div>

        {/* Progress bar — Uber uses thin bars */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[5px] bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${capacityPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                isFull
                  ? "bg-[#E11900]"
                  : capacityPercent > 75
                  ? "bg-[#FFB800]"
                  : "bg-[#000000] dark:bg-[#FFFFFF]"
              )}
            />
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium whitespace-nowrap text-[#6B6B6B]">
            <Users className="h-3.5 w-3.5" />
            <span className={cn(
              isFull && "text-[#E11900] font-bold"
            )}>
              {activity.playersJoined}/{activity.playersNeeded}
            </span>
          </span>
        </div>

        {/* Footer: avatars + action */}
        <div className="flex items-center justify-between pt-2 border-t border-[#F6F6F6] dark:border-[#1A1A1A]">
          {/* Avatars */}
          <div className="flex -space-x-2">
            {activity.players.slice(0, 4).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="h-7 w-7 rounded-full border-2 border-[#FFFFFF] dark:border-[#000000] bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-[10px] font-bold text-[#000000] dark:text-[#FFFFFF]"
                title={p.name}
              >
                {p.name[0]}
              </motion.div>
            ))}
            {activity.players.length > 4 && (
              <div className="h-7 w-7 rounded-full border-2 border-[#FFFFFF] dark:border-[#000000] bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-[10px] font-medium text-[#6B6B6B]">
                +{activity.players.length - 4}
              </div>
            )}
            {activity.players.length === 0 && (
              <span className="text-xs text-[#6B6B6B]">Be the first!</span>
            )}
          </div>

          {/* Action */}
          {variant === "join" ? (
            isFull ? (
              <span className="text-xs font-medium text-[#E11900] bg-[#FFF0ED] dark:bg-[#1A0500] px-4 py-2 rounded-full">
                Full
              </span>
            ) : justJoined || isAlreadyJoined ? (
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 text-xs font-medium text-[#06C167] bg-[#E6F9EF] dark:bg-[#001A0D] px-4 py-2 rounded-full"
              >
                <Check className="h-3.5 w-3.5" />
                Joined
              </motion.span>
            ) : (
              <Button size="sm" onClick={handleJoin}>
                Join
              </Button>
            )
          ) : (
            <Link href={`/activity/${activity.id}`}>
              <Button size="sm" variant="outline">
                View
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
