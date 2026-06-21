"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
  getReferralProfile,
  getReferralHistory,
  getReferralLink,
  applyReferralCode,
  ReferralProfile,
  ReferralRecord,
  REFERRALS_NEEDED,
} from "@/lib/referral-service";
import {
  Gift,
  Copy,
  Share2,
  Crown,
  Users,
  Check,
  Star,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function ReferralPage() {
  const { user } = useAuthStore();
  const currentUser = useCurrentUser();
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [history, setHistory] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    async function loadData() {
      try {
        const [profileData, historyData] = await Promise.all([
          getReferralProfile(user!.uid),
          getReferralHistory(user!.uid),
        ]);
        setProfile(profileData);
        setHistory(historyData);

        // Celebrate if just earned premium
        if (profileData.isPremium) {
          // Small confetti on load if premium
        }
      } catch (err) {
        console.error("Failed to load referral data:", err);
      }
      setLoading(false);
    }

    loadData();
  }, [user?.uid]);

  const handleCopyCode = async () => {
    if (!profile) return;
    try {
      await navigator.clipboard.writeText(profile.referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleShareLink = async () => {
    if (!profile) return;
    const link = getReferralLink(profile.referralCode);
    const text = `Join me on MeetNow! Use my code ${profile.referralCode} to sign up. ${link}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Join MeetNow", text, url: link });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Share link copied to clipboard!");
    }
  };

  const handleWhatsAppShare = () => {
    if (!profile) return;
    const link = getReferralLink(profile.referralCode);
    const text = encodeURIComponent(
      `🎉 Hey! Join me on *MeetNow* — discover and join activities near you!\n\nUse my referral code: *${profile.referralCode}*\n\n${link}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleRedeemCode = async () => {
    if (!redeemCode.trim() || !user?.uid || !currentUser?.name) return;
    setRedeeming(true);

    const result = await applyReferralCode(
      user.uid,
      currentUser.name,
      redeemCode.trim()
    );

    if (result.success) {
      toast.success(result.message);
      setRedeemCode("");
      // Reload profile
      const updated = await getReferralProfile(user.uid);
      setProfile(updated);
    } else {
      toast.error(result.message);
    }

    setRedeeming(false);
  };

  const progress = profile ? Math.min(profile.referralCount / REFERRALS_NEEDED, 1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-[#7C3AED] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-6 lg:px-14 xl:px-20 py-8 bg-[#FFFFFF] dark:bg-[#000000] min-h-screen pb-24">
      {/* Back button */}
      <Link
        href="/profile"
        className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#000000] dark:hover:text-[#FFFFFF] transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm font-medium">Back to Profile</span>
      </Link>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] mb-4">
          <Gift className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-[#000000] dark:text-[#FFFFFF]">
          Refer & Get Premium
        </h1>
        <p className="text-[#6B6B6B] mt-2 max-w-sm mx-auto">
          Invite {REFERRALS_NEEDED} friends and unlock Premium features — ad-free experience, priority
          listings, and a special badge!
        </p>
      </motion.div>

      {/* Premium Status Banner */}
      {profile?.isPremium && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-[#7C3AED] to-[#EC4899] rounded-2xl p-5 text-white text-center"
        >
          <Crown className="h-8 w-8 mx-auto mb-2" />
          <h2 className="text-xl font-black">You&apos;re Premium! 🎉</h2>
          <p className="text-sm opacity-90 mt-1">
            Enjoy ad-free experience, priority listings, and your exclusive badge.
          </p>
        </motion.div>
      )}

      {/* Progress Section */}
      {!profile?.isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">
              Your Progress
            </span>
            <span className="text-sm font-bold text-[#7C3AED]">
              {profile?.referralCount || 0} / {REFERRALS_NEEDED}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-[#E2E2E2] dark:bg-[#333333] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] rounded-full"
            />
          </div>

          {/* Milestones */}
          <div className="flex justify-between mt-3">
            {Array.from({ length: REFERRALS_NEEDED }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    i < (profile?.referralCount || 0)
                      ? "bg-[#7C3AED] text-white"
                      : "bg-[#E2E2E2] dark:bg-[#333333] text-[#6B6B6B]"
                  }`}
                >
                  {i < (profile?.referralCount || 0) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Users className="h-4 w-4" />
                  )}
                </div>
                <span className="text-[10px] text-[#6B6B6B]">
                  {i === REFERRALS_NEEDED - 1 ? "🎉" : `Friend ${i + 1}`}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Referral Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-[#6B6B6B] mb-3">Your Referral Code</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-[#FFFFFF] dark:bg-[#000000] border-2 border-dashed border-[#7C3AED] rounded-xl px-4 py-3 text-center">
            <span className="text-2xl font-black tracking-wider text-[#7C3AED]">
              {profile?.referralCode || "---"}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="h-12 w-12 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center hover:bg-[#6D28D9] transition-colors"
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl py-3 font-semibold text-sm hover:bg-[#20BD5A] transition-colors"
          >
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleShareLink}
            className="flex-1 flex items-center justify-center gap-2 bg-[#000000] dark:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#000000] rounded-xl py-3 font-semibold text-sm hover:opacity-80 transition-opacity"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Link</span>
          </button>
        </div>
      </motion.div>

      {/* Redeem Code Section */}
      {!profile?.referredBy && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-[#6B6B6B] mb-3">
            Have a referral code?
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g. MN-ABC123)"
              className="flex-1 px-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] rounded-xl text-sm font-medium text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
            <button
              onClick={handleRedeemCode}
              disabled={!redeemCode.trim() || redeeming}
              className="px-5 py-3 bg-[#7C3AED] text-white rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {redeeming ? "..." : "Apply"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Premium Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-2xl p-5"
      >
        <h3 className="text-sm font-semibold text-[#6B6B6B] mb-4">Premium Benefits</h3>
        <div className="flex flex-col gap-3">
          {[
            { icon: Sparkles, title: "Ad-Free Experience", desc: "No ads anywhere in the app" },
            { icon: Star, title: "Priority Listings", desc: "Your activities appear at the top" },
            { icon: Crown, title: "Premium Badge", desc: "Stand out with a gold badge on your profile" },
            { icon: Users, title: "Unlimited Activities", desc: "Create unlimited activities per day" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#7C3AED]/10 to-[#EC4899]/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">{title}</p>
                <p className="text-xs text-[#6B6B6B]">{desc}</p>
              </div>
              {profile?.isPremium && (
                <Check className="h-5 w-5 text-[#06C167] ml-auto" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Referral History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#F6F6F6] dark:bg-[#1A1A1A] rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-[#6B6B6B] mb-3">
            Friends You Referred ({history.length})
          </h3>
          <div className="flex flex-col gap-2">
            {history.map((record, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 border-b border-[#E2E2E2] dark:border-[#333333] last:border-0"
              >
                <div className="h-8 w-8 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#7C3AED]">
                    {record.referredUserName?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#000000] dark:text-[#FFFFFF]">
                    {record.referredUserName}
                  </p>
                </div>
                <Check className="h-4 w-4 text-[#06C167]" />
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
