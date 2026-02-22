"use client";

import { motion } from "framer-motion";
import { GraduationCap, Users, UserCog, Sparkles } from "lucide-react";
import { LoginCard } from "../ui/LoginCard";
import CyberneticGridShader from "@/components/ui/cybernetic-grid-shader";
import { useState } from "react";
import { LoginModal } from "./LoginModal";

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleClick = (roleKey: string) => {
    setSelectedRole(roleKey);
    setIsModalOpen(true);
  };

  const roles = [
    {
      title: "Student Portal",
      role: "STUDENT",
      tagline: "Tasks · Discussions · Hackathons · AI Chat",
      description:
        "Your to-dos, your class schedule, and community Q&A — all in one tab. No more digging through 7 WhatsApp groups.",
      icon: GraduationCap,
      accentColor: "#3b82f6",
      accentBg: "bg-blue-500/10 dark:bg-blue-500/15",
      accentText: "text-blue-600 dark:text-blue-400",
      accentBorder: "border-blue-500/30",
      btnClass: "bg-blue-600 hover:bg-blue-700 text-white",
      delay: 0.1,
      onClick: () => handleRoleClick("STUDENT"),
    },
    {
      title: "CR / IC Portal",
      role: "CLASS REP",
      tagline: "Broadcast · Timetables · Deadlines",
      description:
        "Push updates to your entire class instantly. They'll actually see it — not buried under 200 good morning messages.",
      icon: Users,
      accentColor: "#8b5cf6",
      accentBg: "bg-violet-500/10 dark:bg-violet-500/15",
      accentText: "text-violet-600 dark:text-violet-400",
      accentBorder: "border-violet-500/30",
      btnClass: "bg-violet-600 hover:bg-violet-700 text-white",
      delay: 0.2,
      onClick: () => handleRoleClick("CLASS REP"),
    },
    {
      title: "Management",
      role: "ADMIN",
      tagline: "Oversight · Events · Analytics",
      description:
        "Centralized control over departments, events, and student engagement. Everything you need, nothing you don't.",
      icon: UserCog,
      accentColor: "#f59e0b",
      accentBg: "bg-amber-500/10 dark:bg-amber-500/15",
      accentText: "text-amber-600 dark:text-amber-400",
      accentBorder: "border-amber-500/30",
      btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
      delay: 0.3,
      onClick: () => handleRoleClick("ADMIN"),
    },
  ];

  return (
    <section
      id="portals"
      className="relative min-h-screen flex flex-col justify-center items-center pt-28 pb-20 px-5 overflow-hidden bg-background"
    >
      {/* Cybernetic Grid WebGL Background */}
      <CyberneticGridShader />

      {/* Vignette fade at edges */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,var(--color-background)_100%)]" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center mb-8"
        >
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground text-xs font-mono">
            <Sparkles className="w-3 h-3 text-primary" />
            Currently in beta · Built for Indian colleges
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-center mb-5"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl text-foreground tracking-tight mb-5 leading-[1.1]">
            Stop managing your academic
            <br className="hidden sm:block" />
            <span className="text-primary"> life in group chats.</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Tasks, timetables, discussions, hackathons — Sathi keeps everything
            organized and synced across your entire batch.
            <span className="text-foreground font-medium"> Automatically.</span>
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center justify-center gap-6 mb-12 text-xs text-muted-foreground font-mono"
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live sync
          </span>
          <span className="opacity-40">·</span>
          <span>No signup required to explore</span>
          <span className="opacity-40">·</span>
          <span>Zero tracking</span>
        </motion.div>

        {/* Portal cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role, i) => (
            <motion.div
              key={role.role}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
            >
              <LoginCard {...role} />
            </motion.div>
          ))}
        </div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-6 font-mono"
        >
          Sign in with your institute domain ID + OTP — no passwords, no hassle.
        </motion.p>
      </div>

      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        role={selectedRole}
      />
    </section>
  );
}
