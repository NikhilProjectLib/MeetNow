"use client";

import { useActivityStore } from "@/stores/activity-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { signOut } from "@/lib/auth-service";
import { Calendar, Trophy, LogOut, ChevronRight } from "lucide-react";
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
    <div className="flex flex-col gap-8 px-6 lg:px-14 xl:px-20 py-8 bg-[#FFFFFF] dark:bg-[#000000] min-h-screen max-w-3xl">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">
            {initial}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">{displayName}</h1>
          <p className="text-sm text-[#6B6B6B]">{user?.email || ""}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8">
        <div>
          <span className="text-3xl font-black text-[#000000] dark:text-[#FFFFFF]">{joinedActivities.length}</span>
          <p className="text-sm text-[#6B6B6B]">Joined</p>
        </div>
        <div>
          <span className="text-3xl font-black text-[#000000] dark:text-[#FFFFFF]">{createdActivities.length}</span>
          <p className="text-sm text-[#6B6B6B]">Created</p>
        </div>
      </div>

      {/* Menu items — Uber settings style */}
      <div className="flex flex-col">
        <Link
          href="/my-activities"
          className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
            <div>
              <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">My Activities</p>
              <p className="text-xs text-[#6B6B6B]">{joinedActivities.length} joined, {createdActivities.length} created</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
        </Link>

        <Link
          href="/create"
          className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
            <div>
              <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">Create Activity</p>
              <p className="text-xs text-[#6B6B6B]">Start a new event or meetup</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
        </Link>
      </div>

      {/* Recent Activities */}
      {joinedActivities.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF] mb-3">Recent</h2>
          <div className="flex flex-col gap-2">
            {joinedActivities.slice(0, 5).map((activity) => (
              <Link
                key={activity.id}
                href={`/activity/${activity.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F6F6] dark:bg-[#1A1A1A] hover:bg-[#EEEEEE] dark:hover:bg-[#262626] transition-colors"
              >
                <span className="text-xl">{activity.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF] truncate">{activity.name}</p>
                  <p className="text-xs text-[#6B6B6B]">{activity.date} · {activity.time}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#6B6B6B]" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sign Out */}
      <button
        onClick={() => signOut()}
        className="flex items-center gap-3 py-4 -mx-4 px-4 rounded-lg hover:bg-[#FFF0ED] dark:hover:bg-[#1A0500] transition-colors mt-4"
      >
        <LogOut className="h-5 w-5 text-[#E11900]" />
        <span className="text-[0.9375rem] font-medium text-[#E11900]">Sign Out</span>
      </button>
    </div>
  );
}
