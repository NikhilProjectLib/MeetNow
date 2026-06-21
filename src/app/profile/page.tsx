"use client";

import { useState, useEffect } from "react";
import { useActivityStore } from "@/stores/activity-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTranslation } from "@/hooks/use-translation";
import { signOut } from "@/lib/auth-service";
import { getCurrentPosition } from "@/lib/geo-utils";
import {
  Calendar, Trophy, LogOut, ChevronRight, MapPin, Moon, Sun,
  Shield, Bell, HelpCircle, MessageSquare, Navigation, Gift, Crown
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { LanguageSelector } from "@/components/language-selector";
import { getReferralProfile, ReferralProfile } from "@/lib/referral-service";
import { isAdminEmail } from "@/lib/admin-service";

export default function ProfilePage() {
  const { activities, userLocation, setUserLocation } = useActivityStore();
  const [referralProfile, setReferralProfile] = useState<ReferralProfile | null>(null);
  const { user } = useAuthStore();
  const currentUser = useCurrentUser();
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Load referral profile
  useEffect(() => {
    if (user?.uid) {
      getReferralProfile(user.uid).then(setReferralProfile).catch(() => {});
    }
  }, [user?.uid]);

  const joinedActivities = activities.filter((a) =>
    a.players.some((p) => p.id === currentUser?.id)
  );
  const createdActivities = activities.filter((a) => a.createdBy === currentUser?.id);

  const displayName = currentUser?.name || "User";
  const initial = displayName[0]?.toUpperCase() || "U";

  const handleUpdateLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await getCurrentPosition();
      setUserLocation(pos);
      toast.success(t.location_updated, { description: `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` });
    } catch {
      toast.error(t.location_error, { description: t.location_enable });
    }
    setIsLocating(false);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.info(darkMode ? "Light mode (follows system)" : "Dark mode (follows system)", {
      description: "Theme follows your system preference"
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Convert to base64 data URL (simple approach, no storage needed)
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const { updateProfile } = await import("firebase/auth");
        const { auth } = await import("@/lib/firebase");
        if (auth.currentUser) {
          // For a real app you'd upload to Firebase Storage and get a URL
          // Using a small placeholder approach — update display in auth
          await updateProfile(auth.currentUser, { photoURL: reader.result as string });
          toast.success("Profile photo updated!");
          // Force re-render
          window.location.reload();
        }
      } catch {
        toast.error("Failed to update photo");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-6 px-6 lg:px-14 xl:px-20 py-8 bg-[#FFFFFF] dark:bg-[#000000] min-h-screen">

      {/* Profile Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-[#E2E2E2] dark:border-[#333333]">
        {/* Avatar with upload */}
        <div className="relative group">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">
              {initial}
            </div>
          )}
          <label className="absolute inset-0 rounded-full bg-[#000000]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
            <span className="text-[#FFFFFF] text-xs font-medium">Edit</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">{displayName}</h1>
            {referralProfile?.isPremium && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white text-[10px] font-bold">
                <Crown className="h-3 w-3" />
                PREMIUM
              </span>
            )}
          </div>
          <p className="text-sm text-[#6B6B6B]">{user?.email || ""}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 pb-6 border-b border-[#E2E2E2] dark:border-[#333333]">
        <div>
          <span className="text-3xl font-black text-[#000000] dark:text-[#FFFFFF]">{joinedActivities.length}</span>
          <p className="text-sm text-[#6B6B6B]">{t.profile_joined}</p>
        </div>
        <div>
          <span className="text-3xl font-black text-[#000000] dark:text-[#FFFFFF]">{createdActivities.length}</span>
          <p className="text-sm text-[#6B6B6B]">{t.profile_created}</p>
        </div>
      </div>

      {/* Account Section */}
      <div>
        <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">{t.nav_profile}</h2>
        <div className="flex flex-col">
          <Link href="/my-activities" className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">{t.profile_my_activities}</p>
                <p className="text-xs text-[#6B6B6B]">{joinedActivities.length} {t.profile_joined}, {createdActivities.length} {t.profile_created}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </Link>

          <Link href="/create" className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">{t.profile_create_activity}</p>
                <p className="text-xs text-[#6B6B6B]">{t.profile_start_event}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </Link>

          <Link href="/referral" className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-[#7C3AED]" />
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">Refer & Get Premium</p>
                <p className="text-xs text-[#6B6B6B]">
                  {referralProfile?.isPremium
                    ? "You're Premium! Share with friends"
                    : `Invite 3 friends to unlock Premium`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {referralProfile?.isPremium && (
                <span className="h-2 w-2 rounded-full bg-[#06C167]" />
              )}
              <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
            </div>
          </Link>
        </div>
      </div>

      {/* Settings Section */}
      <div>
        <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">{t.settings_title}</h2>
        <div className="flex flex-col">
          {/* My Location */}
          <button
            onClick={handleUpdateLocation}
            disabled={isLocating}
            className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left"
          >
            <div className="flex items-center gap-3">
              <Navigation className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">{t.settings_location}</p>
                <p className="text-xs text-[#6B6B6B]">
                  {isLocating
                    ? t.settings_location_updating
                    : userLocation
                    ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                    : t.settings_location_update}
                </p>
              </div>
            </div>
            <MapPin className="h-5 w-5 text-[#6B6B6B]" />
          </button>

          {/* Language */}
          <LanguageSelector variant="full" />

          {/* Screen Mode */}
          <button
            onClick={handleToggleDarkMode}
            className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left"
          >
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" /> : <Sun className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />}
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">{t.settings_dark_mode}</p>
                <p className="text-xs text-[#6B6B6B]">{darkMode ? t.settings_dark : t.settings_light} ({t.settings_follows_system})</p>
              </div>
            </div>
            <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${darkMode ? "bg-[#06C167] justify-end" : "bg-[#E2E2E2] dark:bg-[#333333] justify-start"}`}>
              <div className="h-5 w-5 rounded-full bg-[#FFFFFF] shadow-sm" />
            </div>
          </button>

          {/* Notifications */}
          <button className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">{t.settings_notifications}</p>
                <p className="text-xs text-[#6B6B6B]">{t.settings_notifications_desc}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </button>

          {/* Privacy */}
          <Link href="/privacy" className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">{t.settings_privacy}</p>
                <p className="text-xs text-[#6B6B6B]">{t.settings_privacy_desc}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </Link>
        </div>
      </div>

      {/* Support Section */}
      <div>
        <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">{t.support_title}</h2>
        <div className="flex flex-col">
          {/* Admin Panel (only for admins) */}
          {isAdminEmail(user?.email || null) && (
            <Link href="/admin" className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#7C3AED]/5 -mx-4 px-4 rounded-lg transition-colors w-full text-left">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-[#7C3AED]" />
                <div>
                  <p className="text-[0.9375rem] font-medium text-[#7C3AED]">Admin Panel</p>
                  <p className="text-xs text-[#6B6B6B]">Manage users, plans, and settings</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#7C3AED]" />
            </Link>
          )}
          <Link href="/contact" className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">{t.support_help}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </Link>

          <Link href="/contact" className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">{t.support_feedback}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </Link>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => signOut()}
        className="flex items-center gap-3 py-4 -mx-4 px-4 rounded-lg hover:bg-[#FFF0ED] dark:hover:bg-[#1A0500] transition-colors mt-2"
      >
        <LogOut className="h-5 w-5 text-[#E11900]" />
        <span className="text-[0.9375rem] font-medium text-[#E11900]">{t.sign_out}</span>
      </button>

      {/* App version */}
      <p className="text-center text-[11px] text-[#6B6B6B] pb-4">{t.version}</p>
    </div>
  );
}
