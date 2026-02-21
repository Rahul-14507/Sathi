"use client";

import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { RoleDetails } from "@/components/landing/RoleDetails";
import { Footer } from "@/components/landing/Footer";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card hover:bg-accent transition-colors duration-200 overflow-hidden"
        aria-label="Toggle theme"
      >
        <Sun className="w-4 h-4 text-amber-400" />
      </button>
    );
  }

  const isDark = theme === "dark";
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card hover:bg-accent transition-colors duration-200 overflow-hidden"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 32,
    restDelta: 0.001,
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform origin-left z-50"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 p-1 border border-white/10">
                <img
                  src="/Sathi.png"
                  alt="Sathi Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-foreground tracking-tight">
                Sathi
              </span>
            </div>
            <span className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
              beta
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <Features />
        <RoleDetails />

        {/* Simple CTA */}
        <section className="py-24 bg-background border-t border-border">
          <div className="max-w-6xl mx-auto px-5 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
                Built by students · Open source
              </p>
              <h2 className="text-3xl md:text-4xl text-foreground mb-4 tracking-tight">
                Your batch is already falling behind.
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Sathi is free to use. No premium tier, no data selling. Just a
                cleaner way to handle college.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="#portals"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get started — it's free
                </a>
                <a
                  href="https://github.com/Rahul-14507/Sathi"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground hover:bg-accent transition-colors"
                >
                  View on GitHub
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
