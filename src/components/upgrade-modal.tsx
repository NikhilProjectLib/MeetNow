"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Users, Gift } from "lucide-react";
import { useUserProfileStore } from "@/stores/user-profile-store";
import { getReferralProgress } from "@/lib/referral-service";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  const { profile } = useUserProfileStore();
  const progress = getReferralProgress(profile);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#000000]/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#FFFFFF] dark:bg-[#1A1A1A] rounded-2xl p-6 shadow-xl"
          >
            {/* Close button */}
            <button onClick={onClose} className="absolute top-4 right-4 text-[#6B6B6B] hover:text-[#000000] dark:hover:text-[#FFFFFF]">
              <X className="h-5 w-5" />
            </button>

            {/* Crown icon */}
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Crown className="h-8 w-8 text-[#FFFFFF]" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-black text-center text-[#000000] dark:text-[#FFFFFF] mb-2">
              Unlock Premium
            </h2>

            {/* Reason */}
            {reason && (
              <p className="text-sm text-center text-[#6B6B6B] mb-4">{reason}</p>
            )}

            {/* Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#F6F6F6] dark:bg-[#000000] flex items-center justify-center">
                  <Users className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
                </div>
                <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">Unlimited activities & joins</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#F6F6F6] dark:bg-[#000000] flex items-center justify-center">
                  <Gift className="h-4 w-4 text-[#000000] dark:text-[#FFFFFF]" />
                </div>
                <span className="text-sm text-[#000000] dark:text-[#FFFFFF]">Full chat, history & ad-free</span>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-5">
              <div className="flex justify-between text-xs text-[#6B6B6B] mb-1.5">
                <span>Referral progress</span>
                <span>{progress.count}/{progress.needed} friends</span>
              </div>
              <div className="h-2.5 bg-[#E2E2E2] dark:bg-[#333333] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${(progress.count / progress.needed) * 100}%` }}
                />
              </div>
              <p className="text-xs text-[#6B6B6B] mt-1.5">
                {progress.isComplete
                  ? "🎉 You've unlocked Premium!"
                  : `Invite ${progress.needed - progress.count} more friend${progress.needed - progress.count === 1 ? "" : "s"} to unlock`}
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/invite"
              onClick={onClose}
              className="uber-btn w-full h-12 text-[0.9375rem] flex items-center justify-center gap-2"
            >
              <Gift className="h-4 w-4" />
              Invite Friends
            </Link>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
