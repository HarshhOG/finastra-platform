"use client";

import { useAuthStore } from "../stores/auth-store";
import { getApiBaseUrl } from "./client";

async function runRequest(path: string, accessToken: string, init?: RequestInit) {
  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {})
    },
    credentials: "include"
  });
}

export async function fetchAdminJson<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
) {
  let response = await runRequest(path, accessToken, init);

  if (response.status === 401) {
    const { refreshToken, setSession, clearSession } = useAuthStore.getState();

    if (!refreshToken) {
      clearSession();
      throw new Error("Session expired.");
    }

    const refreshResponse = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken })
    });

    if (!refreshResponse.ok) {
      clearSession();
      throw new Error("Session expired.");
    }

    const refreshed = (await refreshResponse.json()) as {
      accessToken: string;
      refreshToken: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
      };
    };

    setSession(refreshed);
    response = await runRequest(path, refreshed.accessToken, init);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message ?? error?.error ?? "Request failed.");
  }

  return (await response.json()) as T;
}
