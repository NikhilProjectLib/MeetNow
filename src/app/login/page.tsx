"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "@/lib/auth-service";
import { getOrCreateUserProfile } from "@/lib/referral-service";
import { useUserProfileStore } from "@/stores/user-profile-store";
import { Zap, Mail, Loader2, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslation } from "@/hooks/use-translation";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setProfile } = useUserProfileStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check URL for referral code
  useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        setReferralCode(ref);
        setMode("signup");
      }
    }
  });

  const handleGoogle = async () => {
    setIsLoading(true);
    setError("");
    try {
      const user = await signInWithGoogle();
      const profile = await getOrCreateUserProfile(
        user.uid,
        user.displayName || "User",
        user.email || "",
        user.photoURL,
        referralCode || undefined
      );
      setProfile(profile);
      router.push("/");
    } catch (err: any) {
      setError(err.message || t.google_signin_failed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      if (mode === "signup") {
        if (!name.trim()) { setError(t.name_required); setIsLoading(false); return; }
        const user = await signUpWithEmail(email, password, name);
        const profile = await getOrCreateUserProfile(
          user.uid,
          name,
          email,
          null,
          referralCode || undefined
        );
        setProfile(profile);
      } else {
        await signInWithEmail(email, password);
      }
      router.push("/");
    } catch (err: any) {
      const msg = err.code === "auth/user-not-found" ? t.no_account_found
        : err.code === "auth/wrong-password" ? t.incorrect_password
        : err.code === "auth/email-already-in-use" ? t.email_already_used
        : err.code === "auth/weak-password" ? t.weak_password
        : err.message || t.something_went_wrong;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FFFFFF] dark:bg-[#000000] relative">
      {/* Language selector — top right */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector variant="minimal" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#000000] dark:bg-[#FFFFFF] shadow-lg mb-4"
          >
            <Zap className="h-7 w-7 text-[#FFFFFF] dark:text-[#000000]" />
          </motion.div>
          <h1 className="text-2xl font-black text-[#000000] dark:text-[#FFFFFF]">{t.app_name}</h1>
          <p className="text-[#6B6B6B] text-sm mt-1">{t.app_tagline}</p>
        </div>

        {/* Card */}
        <div className="p-6 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A]">
          {/* Google Sign In */}
          <button
            onClick={handleGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-full bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] text-[0.9375rem] font-medium text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F6F6F6] dark:hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {t.continue_with_google}
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E2E2E2] dark:border-[#333333]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F6F6F6] dark:bg-[#1A1A1A] px-3 text-[#6B6B6B]">{t.or}</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            {mode === "signup" && (
              <input
                type="text"
                placeholder={t.name_placeholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
              />
            )}
            {mode === "signup" && (
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B6B6B]" />
                <input
                  type="text"
                  placeholder="Referral code (optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
                />
              </div>
            )}
            <input
              type="email"
              placeholder={t.email_placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
            />
            <input
              type="password"
              placeholder={t.password_placeholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] placeholder:text-[#6B6B6B] outline-none border border-[#E2E2E2] dark:border-[#333333] focus:ring-2 focus:ring-[#000000] dark:focus:ring-[#FFFFFF] transition-all"
            />

            {error && (
              <p className="text-xs text-[#E11900] bg-[#FFF0ED] dark:bg-[#1A0500] p-2.5 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="uber-btn w-full h-12 text-[0.9375rem] mt-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  {mode === "login" ? t.sign_in : t.create_account}
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-[#6B6B6B] mt-4">
            {mode === "login" ? t.new_here + " " : t.already_have_account + " "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="text-[#000000] dark:text-[#FFFFFF] font-semibold hover:underline"
            >
              {mode === "login" ? t.create_account : t.sign_in}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
