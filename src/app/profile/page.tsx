"use client";

import { useActivityStore } from "@/stores/activity-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { signOut } from "@/lib/auth-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Calendar, Trophy, TrendingUp, LogOut } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { activities } = useActivityStore();
  const { user } = useAuthStore();
  const currentUser = useCurrentUser();

  const joinedActivities = activities.filter((a) =>
    a.players.some((p) => p.id === currentUser?.id)
  );
  const createdActivities = activities.filter((a) => a.createdBy === currentUser?.id);

  const displayName = currentUser?.name || "User";
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Your account & activity history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">
              {initial}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {user?.email || ""}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 w-full pt-4 border-t">
              <div className="flex flex-col items-center">
                <Calendar className="h-5 w-5 text-primary mb-1" />
                <span className="text-lg font-bold">{joinedActivities.length}</span>
                <span className="text-xs text-muted-foreground">Joined</span>
              </div>
              <div className="flex flex-col items-center">
                <Trophy className="h-5 w-5 text-primary mb-1" />
                <span className="text-lg font-bold">{createdActivities.length}</span>
                <span className="text-xs text-muted-foreground">Created</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="h-5 w-5 text-primary mb-1" />
                <span className="text-lg font-bold">-</span>
                <span className="text-xs text-muted-foreground">Rating</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activities */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {joinedActivities.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Your Activities</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {joinedActivities.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/activity/${activity.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <span className="text-2xl">{activity.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date} • {activity.time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.playersJoined}/{activity.playersNeeded} players
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {createdActivities.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Activities You Created</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {createdActivities.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/activity/${activity.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <span className="text-2xl">{activity.emoji}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{activity.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date} • {activity.time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.playersJoined}/{activity.playersNeeded} players
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sign Out */}
      <Card className="border-red-100">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Sign Out</p>
            <p className="text-xs text-muted-foreground">
              Signed in as {user?.email || "user"}
            </p>
          </div>
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
