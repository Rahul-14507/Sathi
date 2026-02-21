"use client";

import { useState, useEffect, Suspense } from "react";
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
  const [sectionId, setSectionId] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Only fetch sections if they are a student or CR. Management doesn't need sections.
    if (role !== "management") {
      fetch("/api/sections")
        .then((res) => res.json())
        .then((data) => {
          setSections(Array.isArray(data) ? data : []);
          if (data.length > 0) {
            setSectionId(data[0].sectionId);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [role]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: domainId.trim(),
          otp,
          role,
          sectionId: role === "management" ? "NONE" : sectionId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (role === "student") {
          router.push(
            `/student/dashboard?sectionId=${sectionId}&userId=${domainId.trim()}`,
          );
        } else if (role === "cr") {
          router.push(`/cr/dashboard?sectionId=${sectionId}`);
        } else if (role === "management") {
          router.push("/management/dashboard");
        }
      } else {
        setErrorMsg(data.error || "Login Failed");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error during login.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleTitle =
    {
      student: "Student Portal",
      cr: "CR/IC Portal",
      management: "Management Secure Portal",
    }[role as string] || "Login Portal";

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-white">
        {roleTitle}
      </h2>

      {errorMsg && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm text-center">
          {errorMsg}
        </div>
      )}

      {role !== "management" && (
        <div className="space-y-3">
          <Label
            htmlFor="section"
            className="text-slate-300 text-sm font-medium"
          >
            Class Section
          </Label>
          <select
            id="section"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full bg-black/30 border border-white/20 text-white h-12 rounded-xl px-4 outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {sections.length === 0 && (
              <option value="">Loading Sections...</option>
            )}
            {sections.map((sec) => (
              <option key={sec.id} value={sec.sectionId}>
                {sec.sectionName} ({sec.sectionId})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-3">
        <Label
          htmlFor="domainId"
          className="text-slate-300 text-sm font-medium"
        >
          {role === "management"
            ? "Admin Master Username"
            : "Institutional Domain ID"}
        </Label>
        <Input
          id="domainId"
          placeholder={
            role === "management" ? "admin" : "e.g. jdoe@institution.edu"
          }
          value={domainId}
          onChange={(e) => setDomainId(e.target.value)}
          required
          className="bg-black/30 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-12 rounded-xl px-4"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="otp" className="text-slate-300 text-sm font-medium">
          {role === "management"
            ? "Master Password"
            : "One-Time Password (OTP)"}
        </Label>
        <Input
          id="otp"
          type="password"
          placeholder={role === "management" ? "admin" : "Enter 1234 for mock"}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          className="bg-black/30 border-white/20 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 h-12 rounded-xl px-4"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || (role !== "management" && sections.length === 0)}
        className="w-full bg-blue-600 hover:bg-blue-500 h-14 rounded-xl mt-6 text-lg font-semibold shadow-lg shadow-blue-900/40"
      >
        {isLoading ? "Authenticating..." : "Verify & Login"}
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
