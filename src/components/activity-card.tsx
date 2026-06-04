"use client";

import { useState } from "react";
import { Activity } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Check } from "lucide-react";
import { categoryLabels } from "@/lib/mock-data";
import { getCategoryColor, getUrgencyInfo } from "@/lib/category-colors";
import { useCurrentUser } from "@/hooks/use-current-user";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
  const colors = getCategoryColor(activity.category);
  const urgency = getUrgencyInfo(activity.date, activity.time);

  const handleJoin = () => {
    onAction(activity.id);
    setJustJoined(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
    <Card className={cn(
      "transition-all hover:shadow-lg hover:-translate-y-0.5 group overflow-hidden",
      colors.border
    )}>
      <div className={cn("h-1", colors.bg)} />

      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center text-2xl", colors.light)}>
              {activity.emoji}
            </div>
            <div>
              <Link href={`/activity/${activity.id}`} className="font-semibold text-base hover:text-primary transition-colors line-clamp-1">
                {activity.name}
              </Link>
              <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium mt-0.5", colors.light, colors.text)}>
                {categoryLabels[activity.category] || activity.category}
              </span>
            </div>
          </div>

          {urgency && (
            <span className={cn("text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap", urgency.bgColor, urgency.color)}>
              {urgency.label}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/60" />
            <span className="truncate max-w-[140px]">{activity.location}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-primary/60" />
            {activity.time}
          </span>
          <span className="text-xs opacity-60">{activity.distance}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isFull ? "bg-red-400" : capacityPercent > 75 ? "bg-orange-400" : colors.bg
              )}
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
          <span className="flex items-center gap-1 text-xs font-medium whitespace-nowrap">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={cn(isFull && "text-red-600 font-semibold")}>
              {activity.playersJoined}/{activity.playersNeeded}
            </span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex -space-x-2">
            {activity.players.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="h-7 w-7 rounded-full border-2 border-background bg-primary/15 flex items-center justify-center text-[10px] font-semibold text-primary"
                title={p.name}
              >
                {p.name[0]}
              </div>
            ))}
            {activity.players.length > 4 && (
              <div className="h-7 w-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                +{activity.players.length - 4}
              </div>
            )}
          </div>

          {variant === "join" ? (
            isFull ? (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-md">
                Full
              </span>
            ) : justJoined || isAlreadyJoined ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-md">
                <Check className="h-3.5 w-3.5" />
                Joined
              </span>
            ) : (
              <Button size="sm" onClick={handleJoin} className="bg-primary hover:bg-primary/90 text-white border-0">
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
      </CardContent>
    </Card>
    </motion.div>
  );
}
