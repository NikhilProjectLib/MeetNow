"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useActivityStore } from "@/stores/activity-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  History,
  CalendarCheck,
  Ticket,
  LogOut,
} from "lucide-react";

type Tab = "upcoming" | "history" | "created";

export default function MyActivitiesPage() {
  const currentUser = useCurrentUser();
  const { activities, leaveActivity } = useActivityStore();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const now = new Date();

  // Activities the user has joined
  const joinedActivities = useMemo(() => {
    if (!currentUser) return [];
    return activities.filter((a) =>
      a.players.some((p) => p.id === currentUser.id)
    );
  }, [activities, currentUser]);

  // Activities the user created
  const createdActivities = useMemo(() => {
    if (!currentUser) return [];
    return activities.filter((a) => a.createdBy === currentUser.id);
  }, [activities, currentUser]);

  // Split into upcoming and past
  const upcoming = useMemo(() => {
    return joinedActivities.filter((a) => {
      const activityDate = new Date(`${a.date}T${a.time || "23:59"}`);
      return activityDate >= now;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
      const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [joinedActivities]);

  const history = useMemo(() => {
    return joinedActivities.filter((a) => {
      const activityDate = new Date(`${a.date}T${a.time || "23:59"}`);
      return activityDate < now;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
      const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    if (target.getTime() === today.getTime()) return "Today";
    if (target.getTime() === tomorrow.getTime()) return "Tomorrow";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Activities</h1>
        <p className="text-muted-foreground mt-1">Track your joined and created activities</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CalendarCheck className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{upcoming.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <History className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{history.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{createdActivities.length}</p>
              <p className="text-xs text-muted-foreground">Created</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit">
        {([
          { id: "upcoming", label: "Upcoming", icon: CalendarCheck },
          { id: "history", label: "History", icon: History },
          { id: "created", label: "Created by me", icon: Trophy },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      {displayList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">
            {activeTab === "upcoming" && "No upcoming activities"}
            {activeTab === "history" && "No past activities yet"}
            {activeTab === "created" && "You haven't created any activities"}
          </p>
          <p className="text-sm mt-1">
            {activeTab === "upcoming" && "Join an activity from the Home or Explore page!"}
            {activeTab === "history" && "Your completed activities will appear here."}
            {activeTab === "created" && "Create your first activity to get started!"}
          </p>
          {activeTab === "created" && (
            <Link href="/create">
              <Button className="mt-4">Create Activity</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {displayList.map((activity) => {
            const player = activity.players.find((p) => p.id === currentUser?.id);
            const isPast = new Date(`${activity.date}T${activity.time || "23:59"}`) < now;

            return (
              <Card key={activity.id} className={cn(
                "transition-all hover:shadow-md hover:-translate-y-0.5",
                isPast && "opacity-75"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Activity info */}
                    <Link href={`/activity/${activity.id}`} className="flex items-center gap-4 min-w-0 flex-1">
                      <span className="text-3xl shrink-0">{activity.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold truncate hover:text-primary transition-colors">{activity.name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(activity.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {activity.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {activity.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {activity.playersJoined}/{activity.playersNeeded}
                          </span>
                        </div>
                      </div>
                    </Link>

                    {/* Right: Status badge + ticket + leave button */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {isPast ? (
                        <span className="text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
                          Completed
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
                          Upcoming
                        </span>
                      )}
                      {player?.ticketId && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                          <Ticket className="h-3 w-3" />
                          {player.ticketId}
                        </span>
                      )}
                      {activeTab === "created" && (
                        <span className="text-[10px] text-primary font-medium">
                          You are the organizer
                        </span>
                      )}
                      {!isPast && activeTab !== "created" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 h-7 px-2 mt-1"
                          onClick={() => currentUser && leaveActivity(activity.id, currentUser.id)}
                        >
                          <LogOut className="h-3 w-3" />
                          Leave
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
