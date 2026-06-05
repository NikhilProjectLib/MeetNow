"use client";

import { use } from "react";
import Link from "next/link";
import { useActivityStore } from "@/stores/activity-store";
import { Button } from "@/components/ui/button";
import { categoryLabels } from "@/lib/mock-data";
import { ArrowLeft, MapPin, Clock, Users, Calendar, Info } from "lucide-react";
import { ActivityChat } from "@/components/activity-chat";
import { OwnerControls } from "@/components/owner-controls";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ShareButton } from "@/components/share-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const currentUser = useCurrentUser();
  const { getActivity, joinActivity, leaveActivity } = useActivityStore();
  const activity = getActivity(id);

  if (!activity) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6">
        <p className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">Activity not found</p>
        <Link href="/" className="uber-btn inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const isPast = new Date(`${activity.date}T${activity.time || "23:59"}`) < new Date();
  const isJoined = currentUser ? activity.players.some((p) => p.id === currentUser.id) : false;
  const isOwner = currentUser ? activity.createdBy === currentUser.id : false;

  if (isPast && !isJoined && !isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-6">
        <p className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">This activity has ended</p>
        <p className="text-sm text-[#6B6B6B]">Only participants can view past activities.</p>
        <Link href="/" className="uber-btn inline-flex">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const isFull = activity.playersJoined >= activity.playersNeeded;
  const capacityPercent = Math.round((activity.playersJoined / activity.playersNeeded) * 100);

  const handleJoin = () => {
    if (!currentUser) return;
    joinActivity(activity.id, { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar });
    toast.success("You joined!", { description: activity.name });
  };

  const handleLeave = () => {
    if (!currentUser) return;
    leaveActivity(activity.id, currentUser.id);
    toast("Left activity", { description: activity.name });
  };

  return (
    <div className="flex flex-col gap-6 px-6 lg:px-14 xl:px-20 py-8 bg-[#FFFFFF] dark:bg-[#000000] min-h-screen max-w-5xl mx-auto">
      {/* Back + Share */}
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1 text-sm font-medium text-[#000000] dark:text-[#FFFFFF] hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <ShareButton activity={activity} />
      </div>

      {/* Hero */}
      <div className="flex items-start gap-5">
        <div className="h-20 w-20 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-4xl shrink-0">
          {activity.emoji}
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-[#000000] dark:text-[#FFFFFF]">{activity.name}</h1>
          <span className="inline-block mt-2 uber-chip uber-chip-active text-xs">
            {categoryLabels[activity.category] || activity.category}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#6B6B6B]" />
              <div>
                <p className="text-[11px] text-[#6B6B6B]">Location</p>
                <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">{activity.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#6B6B6B]" />
              <div>
                <p className="text-[11px] text-[#6B6B6B]">Date</p>
                <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">{activity.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#6B6B6B]" />
              <div>
                <p className="text-[11px] text-[#6B6B6B]">Time</p>
                <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">{activity.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#6B6B6B]" />
              <div>
                <p className="text-[11px] text-[#6B6B6B]">Capacity</p>
                <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">{activity.playersJoined}/{activity.playersNeeded}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {activity.description && (
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-[#6B6B6B]" />
                <h3 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">About</h3>
              </div>
              <p className="text-sm text-[#6B6B6B] leading-relaxed">{activity.description}</p>
            </div>
          )}

          {/* Players */}
          <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
            <h3 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-3">
              Players ({activity.playersJoined}/{activity.playersNeeded})
            </h3>
            {/* Capacity bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-[5px] bg-[#E2E2E2] dark:bg-[#333333] rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", isFull ? "bg-[#E11900]" : "bg-[#000000] dark:bg-[#FFFFFF]")}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
              <span className="text-xs text-[#6B6B6B]">{capacityPercent}%</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activity.players.map((player) => (
                <div key={player.id} className="flex items-center gap-2 rounded-full bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] px-3 py-1.5">
                  <div className="h-6 w-6 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-xs font-bold text-[#000000] dark:text-[#FFFFFF]">
                    {player.name[0]}
                  </div>
                  <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">{player.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <ActivityChat activityId={activity.id} isJoined={isJoined} />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="sticky top-20 p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A] flex flex-col gap-4">
            {isPast ? (
              <>
                <h3 className="font-semibold text-[#000000] dark:text-[#FFFFFF]">Activity Ended</h3>
                <div className="text-sm text-[#6B6B6B] space-y-1">
                  <p>📍 {activity.location}</p>
                  <p>📅 {activity.date} at {activity.time}</p>
                  <p>👥 {activity.playersJoined} participated</p>
                </div>
                <div className="py-2 px-3 rounded-lg bg-[#E2E2E2] dark:bg-[#333333] text-center text-xs text-[#6B6B6B]">
                  This activity has ended
                </div>
              </>
            ) : (
              <>
                <h3 className="font-semibold text-[#000000] dark:text-[#FFFFFF]">Join this activity</h3>
                <div className="text-sm text-[#6B6B6B] space-y-1">
                  <p>📍 {activity.location}</p>
                  <p>📅 {activity.date} at {activity.time}</p>
                  <p>👥 {activity.playersNeeded - activity.playersJoined} spots remaining</p>
                </div>
                {isJoined ? (
                  <button onClick={handleLeave} className="w-full py-3 rounded-full bg-[#FFF0ED] dark:bg-[#1A0500] text-[#E11900] font-medium text-sm hover:bg-[#FFE0DB] transition-colors">
                    Leave Activity
                  </button>
                ) : isFull ? (
                  <button disabled className="w-full py-3 rounded-full bg-[#E2E2E2] dark:bg-[#333333] text-[#6B6B6B] font-medium text-sm cursor-not-allowed">
                    Activity Full
                  </button>
                ) : (
                  <button onClick={handleJoin} className="uber-btn w-full">
                    Join Activity
                  </button>
                )}
              </>
            )}
          </div>

          {isOwner && !isPast && <OwnerControls activity={activity} />}
        </div>
      </div>
    </div>
  );
}
