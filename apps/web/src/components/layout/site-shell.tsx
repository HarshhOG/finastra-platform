import Link from "next/link";
import { ChartSpline, Contact, LayoutDashboard, Trophy, UsersRound, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/college-register", label: "College Register" },
  { href: "/cr-register", label: "CR Register" },
  { href: "/team-pre-registration", label: "Team Registration" },
  { href: "/organising-team", label: "Organising Team" },
  { href: "/contact", label: "Contact" }
];

const mobileItems = [
  { href: "/", label: "Home", icon: ChartSpline },
  { href: "/events", label: "Events", icon: Trophy },
  { href: "/college-register", label: "College", icon: Wallet },
  { href: "/organising-team", label: "Team", icon: UsersRound },
  { href: "/contact", label: "Contact", icon: Contact },
  { href: "/admin/login", label: "Admin", icon: LayoutDashboard }
];

export function SiteShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/65 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2fffd6,#6ee7ff)] text-sm font-black tracking-[0.2em] text-slate-950">
              FA
            </div>
            <div>
              <p className="font-[var(--font-display)] text-sm font-semibold uppercase tracking-[0.32em] text-white/70">
                FINASTRA
              </p>
              <p className="text-sm text-white/45">ARTHYUG digital platform</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/65 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:block">
            <Button asChild variant="secondary">
              <Link href="/admin/login">Admin Portal</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-white/8 bg-slate-950/75 pb-24 pt-12 lg:pb-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.2fr_1fr] lg:px-8">
          <div className="space-y-3">
            <p className="font-[var(--font-display)] text-2xl font-semibold text-white">
              FINASTRA / ARTHYUG
            </p>
            <p className="max-w-2xl text-sm leading-7 text-white/55">
              A dynamic inter-college commerce and finance fest platform with cinematic public
              storytelling, real-time registrations, and enterprise-grade admin workflows.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-white/55">
            {navItems.slice(0, 6).map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>

      <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-6 gap-1 rounded-[28px] border border-white/10 bg-slate-950/85 p-2 backdrop-blur-2xl lg:hidden">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[10px] text-white/60 transition hover:bg-white/8 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
