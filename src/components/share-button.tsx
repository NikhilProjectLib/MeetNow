"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Activity } from "@/types";

interface ShareButtonProps {
  activity: Activity;
}

export function ShareButton({ activity }: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/activity/${activity.id}`
    : "";

  const shareText = `Join me for "${activity.name}" on MeetNow! ${activity.date} at ${activity.time}, ${activity.location}. ${activity.playersNeeded - activity.playersJoined} spots left!`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!", { description: "Share it with your friends" });
    } catch {
      toast.error("Could not copy link");
    }
    setShowOptions(false);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + "\n\n" + shareUrl)}`;
    window.open(url, "_blank");
    setShowOptions(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: activity.name, text: shareText, url: shareUrl });
      } catch { /* user cancelled */ }
    } else {
      setShowOptions(!showOptions);
    }
  };

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={handleNativeShare} className="gap-1.5">
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {showOptions && (
        <div className="absolute right-0 top-full mt-2 bg-card border rounded-lg shadow-xl p-2 z-50 min-w-[160px]">
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
          >
            <MessageCircle className="h-4 w-4 text-green-600" />
            WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}
