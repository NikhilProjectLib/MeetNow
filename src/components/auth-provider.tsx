"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { onAuthChange } from "@/lib/auth-service";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, [setUser, setLoading]);

  return <>{children}</>;
}
