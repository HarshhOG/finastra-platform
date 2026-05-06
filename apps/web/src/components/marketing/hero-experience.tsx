"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import type { HeroContent } from "@finastra/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FinanceTicker } from "./finance-ticker";

const MarketOrb = dynamic(
  () => import("@/components/3d/market-orb").then((module) => module.MarketOrb),
  {
    ssr: false,
    loading: () => (
      <div className="h-[360px] w-full animate-pulse rounded-[32px] border border-white/8 bg-white/6 md:h-[520px]" />
    )
  }
);

export function HeroExperience({
  hero,
  stats
}: {
  hero: HeroContent;
  stats: Array<{ label: string; value: number }>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) {
      return;
    }

    gsap.fromTo(
      cardRef.current.querySelectorAll("[data-hero-card]"),
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out"
      }
    );
  }, []);

  return (
    <section className="section-padding relative mx-auto max-w-7xl py-10 md:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div ref={cardRef} className="space-y-8">
          <Badge>{hero.eyebrow}</Badge>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-5"
          >
            <h1 className="font-[var(--font-display)] text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-white md:text-7xl">
              {hero.title.split("/").map((part, index) => (
                <span key={part}>
                  {index > 0 ? <span className="text-white/35"> / </span> : null}
                  {index === 0 ? part.trim() : <span className="text-gradient">{part.trim()}</span>}
                </span>
              ))}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-white/62 md:text-lg">
              {hero.subtitle}
            </p>
          </motion.div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/events">
                {hero.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/college-register">{hero.secondaryCta}</Link>
            </Button>
          </div>

          <FinanceTicker />

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                data-hero-card
                className="glass-panel rounded-[28px] p-5"
              >
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">{stat.label}</p>
                <p className="mt-4 font-[var(--font-display)] text-3xl font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Sparkles, label: "Cinematic UX" },
              { icon: TrendingUp, label: hero.spotlightMetric },
              { icon: ShieldCheck, label: "Approval-secured CMS" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  data-hero-card
                  className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4"
                >
                  <Icon className="h-5 w-5 text-cyan-200" />
                  <p className="mt-4 text-sm text-white/72">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-3xl" />
          <MarketOrb />
        </div>
      </div>
    </section>
  );
}
