"use client";

import { useState, useRef, useEffect } from "react";
import { Share2, Copy, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Activity } from "@/types";

interface ShareButtonProps {
  activity: Activity;
}

export function ShareButton({ activity }: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/activity/${activity.id}`
    : "";

  const shareText = `Join me for "${activity.name}" on Meelo! ${activity.date} at ${activity.time}, ${activity.location}. ${activity.playersNeeded - activity.playersJoined} spots left!`;

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
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
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleNativeShare}
        className="flex items-center gap-1.5 px-4 py-2 bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-full text-[0.8125rem] font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#E2E2E2] dark:hover:bg-[#333333] transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>

      {showOptions && (
        <div className="absolute right-0 top-full mt-2 bg-[#FFFFFF] dark:bg-[#1A1A1A] border border-[#E2E2E2] dark:border-[#333333] rounded-xl shadow-xl p-1.5 z-50 min-w-[160px]">
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-lg hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors text-[#000000] dark:text-[#FFFFFF]"
          >
            <MessageCircle className="h-4 w-4 text-[#06C167]" />
            WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-lg hover:bg-[#F6F6F6] dark:hover:bg-[#262626] transition-colors text-[#000000] dark:text-[#FFFFFF]"
          >
            <Copy className="h-4 w-4" />
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
}
