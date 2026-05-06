"use client";

import { create } from "zustand";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: SessionUser | null;
  isHydrated: boolean;
  setSession: (payload: { accessToken: string; refreshToken: string; user: SessionUser }) => void;
  clearSession: () => void;
  hydrate: () => void;
};

const storageKey = "finastra-admin-session";

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isHydrated: false,
  setSession: ({ accessToken, refreshToken, user }) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, JSON.stringify({ accessToken, refreshToken, user }));
    }

    set({ accessToken, refreshToken, user, isHydrated: true });
  },
  clearSession: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isHydrated: true
    });
  },
  hydrate: () => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      set({ isHydrated: true });
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        accessToken: string;
        refreshToken: string;
        user: SessionUser;
      };
      set({ ...parsed, isHydrated: true });
    } catch {
      window.localStorage.removeItem(storageKey);
      set({ isHydrated: true });
    }
  }
}));
