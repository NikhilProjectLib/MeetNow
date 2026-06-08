"use client";

import { useState } from "react";
import { useActivityStore } from "@/stores/activity-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { signOut } from "@/lib/auth-service";
import { getCurrentPosition } from "@/lib/geo-utils";
import {
  Calendar, Trophy, LogOut, ChevronRight, MapPin, Globe, Moon, Sun,
  Shield, Bell, HelpCircle, MessageSquare, Navigation
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ProfilePage() {
  const { activities, userLocation, setUserLocation } = useActivityStore();
  const { user } = useAuthStore();
  const currentUser = useCurrentUser();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("English");
  const [isLocating, setIsLocating] = useState(false);

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
      toast.success("Location updated", { description: `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}` });
    } catch {
      toast.error("Could not get location", { description: "Please enable location access" });
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
    <div className="flex flex-col gap-6 px-6 lg:px-14 xl:px-20 py-8 bg-[#FFFFFF] dark:bg-[#000000] min-h-screen max-w-2xl mx-auto">

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
          <h1 className="text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">{displayName}</h1>
          <p className="text-sm text-[#6B6B6B]">{user?.email || ""}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-8 pb-6 border-b border-[#E2E2E2] dark:border-[#333333]">
        <div>
          <span className="text-3xl font-black text-[#000000] dark:text-[#FFFFFF]">{joinedActivities.length}</span>
          <p className="text-sm text-[#6B6B6B]">Joined</p>
        </div>
        <div>
          <span className="text-3xl font-black text-[#000000] dark:text-[#FFFFFF]">{createdActivities.length}</span>
          <p className="text-sm text-[#6B6B6B]">Created</p>
        </div>
      </div>

      {/* Account Section */}
      <div>
        <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">Account</h2>
        <div className="flex flex-col">
          <Link href="/my-activities" className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">My Activities</p>
                <p className="text-xs text-[#6B6B6B]">{joinedActivities.length} joined, {createdActivities.length} created</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </Link>

          <Link href="/create" className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors">
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
      </div>

      {/* Settings Section */}
      <div>
        <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">Settings</h2>
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
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">My Location</p>
                <p className="text-xs text-[#6B6B6B]">
                  {isLocating
                    ? "Updating..."
                    : userLocation
                    ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                    : "Tap to update location"}
                </p>
              </div>
            </div>
            <MapPin className="h-5 w-5 text-[#6B6B6B]" />
          </button>

          {/* Language */}
          <button className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">Language</p>
                <p className="text-xs text-[#6B6B6B]">{language}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </button>

          {/* Screen Mode */}
          <button
            onClick={handleToggleDarkMode}
            className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left"
          >
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" /> : <Sun className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />}
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">Screen Mode</p>
                <p className="text-xs text-[#6B6B6B]">{darkMode ? "Dark" : "Light"} (follows system)</p>
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
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">Notifications</p>
                <p className="text-xs text-[#6B6B6B]">Push & email alerts</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </button>

          {/* Privacy */}
          <button className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <div>
                <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">Privacy & Security</p>
                <p className="text-xs text-[#6B6B6B]">Manage your data</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </button>
        </div>
      </div>

      {/* Support Section */}
      <div>
        <h2 className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">Support</h2>
        <div className="flex flex-col">
          <button className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">Help & FAQ</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </button>

          <button className="flex items-center justify-between py-4 border-b border-[#E2E2E2] dark:border-[#333333] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] -mx-4 px-4 rounded-lg transition-colors w-full text-left">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-[#000000] dark:text-[#FFFFFF]" />
              <p className="text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF]">Send Feedback</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#6B6B6B]" />
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={() => signOut()}
        className="flex items-center gap-3 py-4 -mx-4 px-4 rounded-lg hover:bg-[#FFF0ED] dark:hover:bg-[#1A0500] transition-colors mt-2"
      >
        <LogOut className="h-5 w-5 text-[#E11900]" />
        <span className="text-[0.9375rem] font-medium text-[#E11900]">Sign Out</span>
      </button>

      {/* App version */}
      <p className="text-center text-[11px] text-[#6B6B6B] pb-4">MeetNow v1.0.0</p>
    </div>
  );
}
