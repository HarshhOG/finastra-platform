"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Sparkles,
  TableOfContents
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth-store";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/events", label: "Events", icon: TableOfContents },
  { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/super-admin/overview", label: "Super Admin", icon: Sparkles }
];

export function DashboardShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, refreshToken, user, isHydrated, hydrate, clearSession } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [isHydrated, pathname, router, user]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(47,255,214,0.08),transparent_20%),#020617]">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-white/8 bg-slate-950/80 p-6 backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2fffd6,#6ee7ff)] font-black text-slate-950">
              FA
            </div>
            <div>
              <p className="font-[var(--font-display)] text-lg font-semibold text-white">Control Room</p>
              <p className="text-sm text-white/45">FINASTRA Ops</p>
            </div>
          </Link>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/42">Signed in as</p>
            <p className="mt-3 text-lg font-semibold text-white">{user?.name ?? "Loading..."}</p>
            <p className="text-sm text-cyan-100/70">{user?.role ?? "..."}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition",
                    pathname === item.href
                      ? "bg-cyan-300/14 text-white"
                      : "text-white/58 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Button
            variant="secondary"
            className="mt-8 w-full justify-between"
            onClick={() => {
              if (accessToken) {
                void fetch(`${getApiBaseUrl()}/auth/logout`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                  },
                  credentials: "include",
                  body: JSON.stringify({ refreshToken })
                }).finally(() => {
                  clearSession();
                  router.push("/admin/login");
                });
                return;
              }

              clearSession();
              router.push("/admin/login");
            }}
          >
            Sign out
            <LogOut className="h-4 w-4" />
          </Button>
        </aside>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="glass-panel mb-6 rounded-[32px] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin Workspace</p>
                <h1 className="mt-3 font-[var(--font-display)] text-3xl font-semibold text-white">
                  {title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/58">{description}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/65">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-cyan-200" />
                  Approval-aware operations surface
                </div>
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
