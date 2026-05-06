"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiBaseUrl } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setSession } = useAuthStore();
  const [email, setEmail] = useState("superadmin@finastrafest.in");
  const [password, setPassword] = useState("SuperAdmin@2026");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.28em] text-white/42">Admin Portal</p>
              <h1 className="font-[var(--font-display)] text-3xl font-semibold text-white">
                FINASTRA Control Room
              </h1>
              <p className="text-sm leading-7 text-white/58">
                Use seeded credentials or your approved admin account to enter the workspace.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setLoading(true);
                setError(null);

                try {
                  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({ email, password })
                  });

                  if (!response.ok) {
                    throw new Error("Authentication failed.");
                  }

                  const result = (await response.json()) as {
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

                  setSession(result);
                  router.push(result.user.role === "SUPER_ADMIN" ? "/super-admin/overview" : "/admin/dashboard");
                } catch (loginError) {
                  setError(loginError instanceof Error ? loginError.message : "Login failed.");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <label className="space-y-2">
                <span className="text-sm text-white/68">Email</span>
                <Input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-white/68">Password</span>
                <Input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
              </label>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Enter Admin Workspace"}
              </Button>
            </form>

            {error ? <p className="text-sm text-amber-200">{error}</p> : null}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
