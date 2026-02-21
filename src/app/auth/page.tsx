"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AuthForm() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "student";
  const router = useRouter();

  const [domainId, setDomainId] = useState("");
  const [otp, setOtp] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate setting session
    if (role === "student") {
      router.push("/student/dashboard");
    } else {
      router.push("/cr/dashboard");
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-white">
        {role === "student" ? "Student Portal" : "CR/IC Portal"}
      </h2>

      <div className="space-y-3">
        <Label
          htmlFor="domainId"
          className="text-slate-300 text-sm font-medium"
        >
          Institutional Domain ID
        </Label>
        <Input
          id="domainId"
          placeholder="e.g. jdoe@institution.edu"
          value={domainId}
          onChange={(e) => setDomainId(e.target.value)}
          required
          className="bg-black/30 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-12 rounded-xl px-4"
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="otp" className="text-slate-300 text-sm font-medium">
          One-Time Password (OTP)
        </Label>
        <Input
          id="otp"
          type="password"
          placeholder="Enter 1234 for mock"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="bg-black/30 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-12 rounded-xl px-4"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-500 h-14 rounded-xl mt-6 text-lg font-semibold shadow-lg shadow-blue-900/40"
      >
        Verify & Login
      </Button>
    </form>
  );
}

export default function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100 dark">
      <div className="w-full max-w-md p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
        <Suspense
          fallback={
            <div className="text-center text-slate-400 py-10">
              Loading Portal...
            </div>
          }
        >
          <AuthForm />
        </Suspense>
      </div>
    </main>
  );
}
