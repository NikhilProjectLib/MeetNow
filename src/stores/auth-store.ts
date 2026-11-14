"use client";

import { create } from "zustand";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  /** True while the login form is signing in / up (it handles its own redirect). */
  authInProgress: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setAuthInProgress: (busy: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  authInProgress: false,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setAuthInProgress: (authInProgress) => set({ authInProgress }),
}));
