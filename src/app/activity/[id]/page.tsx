"use client";

import { use } from "react";
import Link from "next/link";
import { useActivityStore } from "@/stores/activity-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockUser, categoryLabels } from "@/lib/mock-data";
import { ArrowLeft, MapPin, Clock, Users, Calendar, Info } from "lucide-react";
import { ActivityChat } from "@/components/activity-chat";
import { OwnerControls } from "@/components/owner-controls";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const currentUser = useCurrentUser();
  const { getActivity, joinActivity, leaveActivity } = useActivityStore();
  const activity = getActivity(id);

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg font-medium text-muted-foreground">Activity not found</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  // Past activities are only visible to joined members
  const isPast = new Date(`${activity.date}T${activity.time || "23:59"}`) < new Date();
  const isJoined = currentUser ? activity.players.some((p) => p.id === currentUser.id) : false;
  const isOwner = currentUser ? activity.createdBy === currentUser.id : false;

  if (isPast && !isJoined && !isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-lg font-medium text-muted-foreground">This activity has ended</p>
        <p className="text-sm text-muted-foreground">Only participants can view past activities.</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const isFull = activity.playersJoined >= activity.playersNeeded;
  const capacityPercent = Math.round((activity.playersJoined / activity.playersNeeded) * 100);

  const handleJoin = () => {
    if (!currentUser) return;
    joinActivity(activity.id, {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
    });
  };

  const handleLeave = () => {
    if (!currentUser) return;
    leaveActivity(activity.id, currentUser.id);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Back button */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-start gap-4">
            <span className="text-5xl">{activity.emoji}</span>
            <div>
              <h1 className="text-2xl font-bold">{activity.name}</h1>
              <span className="inline-block mt-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium capitalize">
                {categoryLabels[activity.category]}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <Card>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">{activity.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">{activity.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium">{activity.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Capacity</p>
                  <p className="text-sm font-medium">{activity.playersJoined}/{activity.playersNeeded}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {activity.description && (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">About this activity</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{activity.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Players */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-medium mb-3">
                Players ({activity.playersJoined}/{activity.playersNeeded})
              </h3>
              {/* Capacity bar */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isFull ? "bg-orange-500" : "bg-primary"
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{capacityPercent}%</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activity.players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5"
                  >
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                      {player.name[0]}
                    </div>
                    <span className="text-sm">{player.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Group Chat */}
          <ActivityChat activityId={activity.id} isJoined={isJoined} />
        </div>

        {/* Sidebar action */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="sticky top-8">
            <CardContent className="p-5 flex flex-col gap-4">
              {isPast ? (
                <>
                  <h3 className="font-medium text-muted-foreground">Activity Ended</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📍 {activity.location}</p>
                    <p>📅 {activity.date} at {activity.time}</p>
                    <p>👥 {activity.playersJoined} participated</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-secondary text-center">
                    <p className="text-xs text-muted-foreground">This activity has ended</p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-medium">Join this activity</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📍 {activity.location}</p>
                    <p>📅 {activity.date} at {activity.time}</p>
                    <p>👥 {activity.playersNeeded - activity.playersJoined} spots remaining</p>
                  </div>
                  {isJoined ? (
                    <Button variant="destructive" className="w-full" onClick={handleLeave}>
                      Leave Activity
                    </Button>
                  ) : isFull ? (
                    <Button disabled className="w-full">
                      Activity Full
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={handleJoin}>
                      Join Activity
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Owner Controls — only visible to activity creator */}
          {isOwner && !isPast && (
            <OwnerControls activity={activity} />
          )}
        </div>
      </div>
    </div>
  );
}
