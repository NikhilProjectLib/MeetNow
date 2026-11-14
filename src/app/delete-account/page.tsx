"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { DeleteAccountPanel } from "@/components/delete-account-panel";
import { loginUrl } from "@/lib/auth-redirect";

/**
 * Public account-deletion page. Google Play requires a web link where users
 * can delete their account (or request deletion) — this is it:
 * https://www.meelo.online/delete-account
 */
export default function DeleteAccountPage() {
  const { user, isLoading } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#000000]">
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
        <Link href={user ? "/profile" : "/"} className="flex items-center gap-1 text-sm font-medium text-[#000000] dark:text-[#FFFFFF] hover:underline w-fit">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#000000] dark:text-[#FFFFFF]">Delete your Meelo account</h1>
          <p className="text-sm text-[#6B6B6B] mt-2">
            You can permanently delete your Meelo account and the personal data linked to it at any time.
          </p>
        </div>

        <section className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A] flex flex-col gap-2 text-sm text-[#000000] dark:text-[#FFFFFF]">
          <h2 className="font-semibold">What gets deleted</h2>
          <ul className="list-disc pl-5 text-[#6B6B6B] space-y-1">
            <li>Your account and login (email or Google sign-in)</li>
            <li>Your profile: name, email, photo, plan and referral details</li>
            <li>Activities you created, including their group chats</li>
            <li>Your place in activities you joined or waitlisted for</li>
            <li>Chat messages you sent and your notifications</li>
          </ul>
          <h2 className="font-semibold mt-2">What is kept</h2>
          <p className="text-[#6B6B6B]">
            Nothing that identifies you. Deletion through the app happens immediately; requests sent by email are
            completed within 7 days.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">Option 1 — Delete it yourself</h2>
          {isLoading ? (
            <div className="h-40 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A] animate-pulse" />
          ) : user ? (
            <DeleteAccountPanel email={user.email} />
          ) : (
            <div className="p-5 rounded-2xl bg-[#F6F6F6] dark:bg-[#1A1A1A] flex flex-col gap-3">
              <p className="text-sm text-[#6B6B6B]">
                Log in to the account you want to delete. In the Meelo app or website you can also go to{" "}
                <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">Profile → Delete account</span>.
              </p>
              <Link href={loginUrl("/delete-account")} className="uber-btn w-full text-center">
                Log in to delete my account
              </Link>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-[#000000] dark:text-[#FFFFFF]">Option 2 — Ask us to delete it</h2>
          <p className="text-sm text-[#6B6B6B]">
            Can&apos;t log in? Email{" "}
            <span className="font-semibold text-[#000000] dark:text-[#FFFFFF]">support@meelo.online</span> from the
            email address on your account with the subject <span className="font-semibold">&quot;Delete my Meelo account&quot;</span>.
            We&apos;ll confirm and delete everything listed above within 7 days.
          </p>
        </section>
      </div>
    </div>
  );
}
