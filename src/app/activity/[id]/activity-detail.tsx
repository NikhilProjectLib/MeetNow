"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useActivityStore } from "@/stores/activity-store";
import { categoryLabels } from "@/lib/mock-data";
import { ArrowLeft, MapPin, Clock, Users, Calendar, Info, Navigation, CalendarPlus } from "lucide-react";
import { ActivityChat } from "@/components/activity-chat";
import { ActivityLocationMap } from "@/components/activity-location-map";
import { OwnerControls } from "@/components/owner-controls";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useUnreadCounts } from "@/hooks/use-unread-counts";
import { ShareButton } from "@/components/share-button";
import { useTierCheck } from "@/hooks/use-tier-check";
import { UpgradeModal } from "@/components/upgrade-modal";
import { AdBanner } from "@/components/ad-banner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { loginUrl } from "@/lib/auth-redirect";
import type { Activity, Player } from "@/types";
import { directionsUrl, googleCalendarUrl } from "@/lib/activity-links";

function toastJoinOutcome(outcome: "joined" | "waitlisted" | "noop", name: string) {
  if (outcome === "joined") toast.success("You joined!", { description: name });
  else if (outcome === "waitlisted") toast("Added to the waitlist", { description: `We'll move you in automatically if a spot opens — ${name}` });
}

/**
 * Activity detail — public. Guests see everything except chat; Join asks them
 * to log in and brings them back here with ?join=1 to finish joining.
 * `initialActivity` comes from the server so shared links render instantly;
 * the live Firestore copy takes over once the store has loaded.
 */
export function ActivityDetail({ id, initialActivity }: { id: string; initialActivity: Activity | null }) {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const { getActivity, joinActivity, leaveActivity, leaveWaitlist, isFirebaseConnected, activities } = useActivityStore();
  const unreadCounts = useUnreadCounts();
  const { checkCanJoin, showUpgrade, upgradeReason, closeUpgrade } = useTierCheck();
  const liveActivity = getActivity(id);
  // Once the live store has loaded, trust it (activity may have been deleted)
  const activity = liveActivity ?? (isFirebaseConnected ? undefined : initialActivity ?? undefined);
  const autoJoinDone = useRef(false);

  // Finish a join that started before login (/activity/:id?join=1)
  useEffect(() => {
    if (autoJoinDone.current || !currentUser || !liveActivity) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("join") !== "1") return;
    autoJoinDone.current = true;
    router.replace(`/activity/${id}`, { scroll: false });
    const alreadyIn =
      liveActivity.players.some((p) => p.id === currentUser.id) ||
      (liveActivity.waitlist || []).some((p) => p.id === currentUser.id);
    const full = liveActivity.playersJoined >= liveActivity.playersNeeded;
    if (alreadyIn || (!full && !checkCanJoin())) return;
    joinActivity(liveActivity.id, { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar })
      .then((outcome) => toastJoinOutcome(outcome, liveActivity.name))
      .catch(() => toast.error("Could not join — please try again"));
  }, [currentUser, liveActivity, id, router, checkCanJoin, joinActivity]);

  // Other upcoming dates of a weekly activity
  const seriesId = activity?.seriesId;
  const activityId = activity?.id;
  const otherDates = useMemo(() => {
    if (!seriesId) return [];
    const now = new Date();
    return activities
      .filter((a) => a.seriesId === seriesId && a.id !== activityId)
      .filter((a) => new Date(`${a.date}T${a.time || "23:59"}`) >= now)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [activities, seriesId, activityId]);

  if (!activity && !isFirebaseConnected) {
    return (
      <div className="flex flex-col gap-4 px-6 lg:px-14 py-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-20 w-20 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]" />
        <div className="h-8 w-2/3 rounded bg-[#F6F6F6] dark:bg-[#1A1A1A]" />
        <div className="h-24 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]" />
      </div>
    );
  }

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
  const waitlist: Player[] = activity.waitlist || [];
  const waitlistPosition = currentUser ? waitlist.findIndex((p) => p.id === currentUser.id) + 1 : 0;
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://www.meelo.online";
  const capacityPercent = Math.round((activity.playersJoined / activity.playersNeeded) * 100);

  const handleJoin = () => {
    if (!currentUser) {
      router.push(loginUrl(`/activity/${activity.id}?join=1`));
      return;
    }
    // Joining the waitlist doesn't count towards plan limits
    if (!isFull && !checkCanJoin()) return;
    joinActivity(activity.id, { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar })
      .then((outcome) => toastJoinOutcome(outcome, activity.name))
      .catch(() => toast.error("Could not join — please try again"));
  };

  const handleLeaveWaitlist = () => {
    if (!currentUser) return;
    leaveWaitlist(activity.id, currentUser.id);
    toast("Left the waitlist", { description: activity.name });
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
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-block uber-chip uber-chip-active text-xs">
              {categoryLabels[activity.category] || activity.category}
            </span>
            {activity.recurrence === "weekly" && (
              <span className="inline-block uber-chip text-xs">
                🔁 Every {new Date(`${activity.date}T00:00`).toLocaleDateString("en-US", { weekday: "long" })}
              </span>
            )}
          </div>
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

          {/* Waitlist */}
          {waitlist.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <h3 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-1">Waitlist ({waitlist.length})</h3>
              <p className="text-xs text-[#6B6B6B] mb-3">First in line gets the next free spot automatically.</p>
              <div className="flex flex-wrap gap-2">
                {waitlist.map((player, i) => (
                  <div key={player.id} className="flex items-center gap-2 rounded-full bg-[#FFFFFF] dark:bg-[#000000] border border-dashed border-[#E2E2E2] dark:border-[#333333] px-3 py-1.5">
                    <span className="text-xs text-[#6B6B6B]">#{i + 1}</span>
                    <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">{player.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other dates of a weekly activity */}
          {otherDates.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
              <h3 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-3">Other dates</h3>
              <div className="flex flex-wrap gap-2">
                {otherDates.map((d) => (
                  <Link key={d.id} href={`/activity/${d.id}`} className="uber-chip text-xs">
                    {new Date(`${d.date}T00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}
                    {Math.max(0, d.playersNeeded - d.playersJoined)} spots
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Location Map */}
          {activity.lat && activity.lng && activity.lat !== 0 && (
            <div className="rounded-2xl overflow-hidden border border-[#E2E2E2] dark:border-[#333333] h-[200px]">
              <ActivityLocationMap lat={activity.lat} lng={activity.lng} name={activity.name} emoji={activity.emoji} />
            </div>
          )}

          {/* Chat — members only; guests get a login prompt */}
          {currentUser ? (
            <ActivityChat
              activityId={activity.id}
              activityName={activity.name}
              participantIds={activity.players.map((p: { id: string }) => p.id)}
              isJoined={isJoined}
              unreadCount={unreadCounts[activity.id] || 0}
            />
          ) : (
            <Link
              href={loginUrl(`/activity/${activity.id}`)}
              className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A] text-sm text-[#6B6B6B] hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors"
            >
              💬 <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">Log in</span> to see the group chat
            </Link>
          )}
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
                ) : waitlistPosition > 0 ? (
                  <>
                    <div className="py-2 px-3 rounded-lg bg-[#FFF8E6] dark:bg-[#2A2000] text-center text-sm text-[#8A6100] dark:text-[#FFB800]">
                      You&apos;re #{waitlistPosition} on the waitlist — you&apos;ll get a spot automatically if someone leaves
                    </div>
                    <button onClick={handleLeaveWaitlist} className="w-full py-3 rounded-full bg-[#E2E2E2] dark:bg-[#333333] text-[#000000] dark:text-[#FFFFFF] font-medium text-sm hover:bg-[#D0D0D0] transition-colors">
                      Leave waitlist
                    </button>
                  </>
                ) : isFull ? (
                  <button onClick={handleJoin} className="uber-btn uber-btn-secondary w-full">
                    {currentUser ? "Join waitlist" : "Log in to join waitlist"}
                    {waitlist.length > 0 ? ` (${waitlist.length} waiting)` : ""}
                  </button>
                ) : (
                  <button onClick={handleJoin} className="uber-btn w-full">
                    {currentUser ? "Join Activity" : "Log in to join"}
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <a href={directionsUrl(activity)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-xs font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors">
                    <Navigation className="h-3.5 w-3.5" /> Directions
                  </a>
                  <a href={googleCalendarUrl(activity, siteUrl)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-xs font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors">
                    <CalendarPlus className="h-3.5 w-3.5" /> Add to calendar
                  </a>
                </div>
              </>
            )}
          </div>

          {isOwner && <OwnerControls activity={activity} />}

          {/* Sidebar Ad */}
          <div className="rounded-2xl overflow-hidden">
            <AdBanner slot="5566778899" format="rectangle" className="rounded-2xl" />
          </div>
        </div>
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={closeUpgrade} reason={upgradeReason} />
    </div>
  );
}
