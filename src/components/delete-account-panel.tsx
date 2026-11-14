"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteMyAccount, hasRecentLogin, RecentLoginRequiredError } from "@/lib/account-service";
import { signOut } from "@/lib/auth-service";
import { loginUrl } from "@/lib/auth-redirect";

/** Confirm-and-delete flow for the signed-in user. */
export function DeleteAccountPanel({ email }: { email: string | null }) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  const reLogin = async () => {
    await signOut().catch(() => {});
    router.push(loginUrl("/delete-account"));
  };

  const handleDelete = async () => {
    setError("");
    if (!hasRecentLogin()) {
      setNeedsLogin(true);
      return;
    }
    setBusy(true);
    try {
      await deleteMyAccount(setProgress);
      toast.success("Your account has been deleted", { description: "Sorry to see you go." });
      router.replace("/");
    } catch (err) {
      if (err instanceof RecentLoginRequiredError) {
        setNeedsLogin(true);
      } else {
        setError(
          "Something went wrong and your account may not be fully deleted. Please try again, or email support@meelo.online and we'll finish it for you."
        );
      }
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  if (needsLogin) {
    return (
      <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[#FFF8E1] dark:bg-[#1A1500] border border-[#FFB800]/40">
        <p className="text-sm font-semibold text-[#000000] dark:text-[#FFFFFF]">Please log in again</p>
        <p className="text-sm text-[#6B6B6B]">
          For your security, deleting an account requires a fresh login. Log in again and you&apos;ll come straight back here.
        </p>
        <button onClick={reLogin} className="uber-btn w-full">Log in again</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[#FFF0ED] dark:bg-[#1A0500] border border-[#E11900]/20">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-[#E11900]" />
        <p className="text-sm font-semibold text-[#E11900]">Delete account{email ? ` (${email})` : ""}</p>
      </div>
      <p className="text-sm text-[#6B6B6B]">
        This is permanent and can&apos;t be undone. Type <span className="font-mono font-semibold text-[#000000] dark:text-[#FFFFFF]">DELETE</span> to confirm.
      </p>
      <input
        value={confirmText}
        onChange={(e) => setConfirmText(e.target.value)}
        placeholder="DELETE"
        autoCapitalize="characters"
        disabled={busy}
        className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#000000] border border-[#E2E2E2] dark:border-[#333333] rounded-lg text-sm text-[#000000] dark:text-[#FFFFFF] outline-none focus:ring-2 focus:ring-[#E11900]"
      />
      {error && <p className="text-sm text-[#E11900]">{error}</p>}
      <button
        onClick={handleDelete}
        disabled={busy || confirmText.trim().toUpperCase() !== "DELETE"}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-[#E11900] text-[#FFFFFF] font-medium text-sm hover:bg-[#C41600] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        {busy ? progress || "Deleting…" : "Permanently delete my account"}
      </button>
    </div>
  );
}
