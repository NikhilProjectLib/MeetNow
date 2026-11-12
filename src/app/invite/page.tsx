"use client";

import { useUserProfileStore } from "@/stores/user-profile-store";
import { shareContent } from "@/lib/native";
import { getReferralProgress } from "@/lib/referral-service";
import { Crown, Copy, Share2, Gift, Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export default function InvitePage() {
  const { profile } = useUserProfileStore();
  const progress = getReferralProgress(profile);
  const [copied, setCopied] = useState(false);

  const referralCode = profile?.referralCode || "------";
  const shareLink = typeof window !== "undefined"
    ? `${window.location.origin}/login?ref=${referralCode}`
    : "";
  const shareText = `Join me on Meelo! Use my code ${referralCode} to sign up. Discover and join nearby activities in real-time. ${shareLink}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      toast.success("Code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShare = async () => {
    const shared = await shareContent({ title: "Join Meelo", text: shareText, url: shareLink });
    if (!shared) {
      // Fallback: copy link
      await navigator.clipboard.writeText(shareText);
      toast.success("Share text copied!");
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#000000] px-6 py-8 lg:px-14 xl:px-20">
      {/* Back button */}
      <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-[#6B6B6B] hover:text-[#000000] dark:hover:text-[#FFFFFF] mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Profile
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 items-center justify-center mb-4">
          <Gift className="h-8 w-8 text-[#FFFFFF]" />
        </div>
        <h1 className="text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">Invite Friends</h1>
        <p className="text-[#6B6B6B] text-sm mt-1">
          {progress.isComplete
            ? "You've unlocked Premium! Keep sharing with friends."
            : `Invite ${progress.needed - progress.count} more friend${progress.needed - progress.count === 1 ? "" : "s"} to unlock Premium`}
        </p>
      </motion.div>

      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">Referral Progress</span>
          <span className="text-sm font-black text-[#000000] dark:text-[#FFFFFF]">{progress.count}/{progress.needed}</span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-3 mb-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex-1">
              <div
                className={`h-3 rounded-full transition-all ${
                  step <= progress.count
                    ? "bg-gradient-to-r from-amber-400 to-orange-500"
                    : "bg-[#E2E2E2] dark:bg-[#333333]"
                }`}
              />
              <p className="text-[10px] text-[#6B6B6B] mt-1 text-center">
                Friend {step} {step <= progress.count ? "✓" : ""}
              </p>
            </div>
          ))}
        </div>

        {/* Status */}
        {progress.isComplete ? (
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Premium Unlocked! 🎉</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
            <Crown className="h-5 w-5 text-amber-500" />
            <span className="text-sm text-amber-700 dark:text-amber-400">
              {progress.needed - progress.count} more to unlock unlimited activities, full chat & ad-free!
            </span>
          </div>
        )}
      </motion.div>

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-2xl p-6 mb-6"
      >
        <p className="text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider mb-3">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#FFFFFF] dark:bg-[#000000] rounded-xl px-5 py-4 border border-[#E2E2E2] dark:border-[#333333]">
            <span className="text-xl font-black tracking-widest text-[#000000] dark:text-[#FFFFFF]">
              {referralCode}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="h-14 w-14 rounded-xl bg-[#000000] dark:bg-[#FFFFFF] flex items-center justify-center hover:opacity-80 transition-opacity"
          >
            {copied ? (
              <Check className="h-5 w-5 text-[#FFFFFF] dark:text-[#000000]" />
            ) : (
              <Copy className="h-5 w-5 text-[#FFFFFF] dark:text-[#000000]" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Share Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <button
          onClick={handleWhatsApp}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-full bg-[#25D366] text-[#FFFFFF] text-[0.9375rem] font-medium hover:opacity-90 transition-opacity"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Share on WhatsApp
        </button>

        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-3 h-12 rounded-full bg-[#000000] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#000000] text-[0.9375rem] font-medium hover:opacity-90 transition-opacity"
        >
          <Share2 className="h-5 w-5" />
          Share Link
        </button>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <h3 className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF] mb-4">How it works</h3>
        <div className="space-y-4">
          {[
            { step: "1", text: "Share your referral code with friends" },
            { step: "2", text: "They enter your code when signing up" },
            { step: "3", text: "After 3 friends join, you get Premium!" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-[#F6F6F6] dark:bg-[#1A1A1A] flex items-center justify-center text-sm font-black text-[#000000] dark:text-[#FFFFFF]">
                {item.step}
              </div>
              <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
