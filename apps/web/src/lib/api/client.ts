const fallbackBaseUrl = "http://localhost:4000/api/v1";
const fallbackSiteUrl = "http://localhost:3000";

export function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? fallbackBaseUrl;
  }

  return process.env.NEXT_PUBLIC_API_URL ?? fallbackBaseUrl;
}

export async function fetchPublicJson<T>(
  path: string,
  init?: RequestInit & {
    revalidate?: number;
  }
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: init?.revalidate ? init.cache : "no-store",
    next: init?.revalidate
      ? {
          revalidate: init.revalidate
        }
      : undefined
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  return (await response.json()) as T;
}

export async function postPublicJson<T>(
  path: string,
  body: unknown,
  init?: RequestInit
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
    ...init
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.error?.message ?? error?.error ?? "Request failed.");
  }

  return (await response.json()) as T;
}

export function buildAbsoluteUrl(pathname: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackSiteUrl;
  return `${base}${pathname}`;
}
