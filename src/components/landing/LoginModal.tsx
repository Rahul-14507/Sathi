"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: string | null;
}

export function LoginModal({ isOpen, onClose, role }: LoginModalProps) {
  const router = useRouter();

  const [domainId, setDomainId] = useState("");
  const [otp, setOtp] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [sections, setSections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [step, setStep] = useState<1 | 2>(1);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDomainId("");
      setOtp("");
      setErrorMsg("");
      setStep(1);
    }
  }, [isOpen]);

  useEffect(() => {
    // Only fetch sections if they are a student or CR. Management doesn't need sections.
    if (role && role !== "ADMIN") {
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (role === "ADMIN") {
        // Management bypasses OTP generation for MVP
        setStep(2);
        setIsLoading(false);
        return;
      }

      // Map roles from Hero (STUDENT, CLASS REP, ADMIN) to API expected roles (student, cr, management)
      const mappedRole =
        role === "STUDENT"
          ? "student"
          : role === "CLASS REP"
            ? "cr"
            : "management";

      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: domainId.trim(),
          role: mappedRole,
          sectionId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("OTP Code sent to your email!");
        setStep(2);
      } else {
        setErrorMsg(data.error || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error requesting OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (role === "ADMIN") return;

      const mappedRole = role === "STUDENT" ? "student" : "cr";

      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          role: mappedRole,
          sectionId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Google Authentication successful!");
        onClose();
        if (mappedRole === "student") {
          // We use the email from Google (returned inside data.domainId)
          router.push(
            `/student/dashboard?sectionId=${sectionId}&userId=${data.domainId}`,
          );
        } else if (mappedRole === "cr") {
          router.push(`/cr/dashboard?sectionId=${sectionId}`);
        }
      } else {
        setErrorMsg(data.error || "Google Login failed.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error during Google validation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const mappedRole =
        role === "STUDENT"
          ? "student"
          : role === "CLASS REP"
            ? "cr"
            : "management";

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: domainId.trim(),
          otp,
          role: mappedRole,
          sectionId: mappedRole === "management" ? "NONE" : sectionId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Authentication successful!");
        onClose(); // Close modal on success
        if (mappedRole === "student") {
          router.push(
            `/student/dashboard?sectionId=${sectionId}&userId=${domainId.trim()}`,
          );
        } else if (mappedRole === "cr") {
          router.push(`/cr/dashboard?sectionId=${sectionId}`);
        } else if (mappedRole === "management") {
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
      STUDENT: "Student Portal",
      "CLASS REP": "CR/IC Portal",
      ADMIN: "Management Secure Portal",
    }[role as string] || "Login Portal";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative w-full max-w-md p-10 bg-card/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ambient glow effect inside modal */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            <form
              onSubmit={
                role === "ADMIN"
                  ? handleLogin
                  : step === 1
                    ? handleSendOtp
                    : handleLogin
              }
              className="relative z-10 space-y-6"
            >
              <h2 className="text-3xl font-bold mb-8 text-center text-foreground tracking-tight">
                {roleTitle}
              </h2>

              {errorMsg && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-sm text-center">
                  {errorMsg}
                </div>
              )}

              {step === 1 && (
                <>
                  {role !== "ADMIN" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >
                      <Label
                        htmlFor="section"
                        className="text-muted-foreground text-sm font-medium"
                      >
                        Class Section
                      </Label>
                      <Select
                        value={sectionId}
                        onValueChange={setSectionId}
                        required
                      >
                        <SelectTrigger className="w-full bg-background/50 border-border text-foreground h-12 rounded-xl px-4 focus:ring-2 focus:ring-primary focus:ring-offset-0">
                          <SelectValue placeholder="Select a section" />
                        </SelectTrigger>
                        <SelectContent className="bg-card/90 backdrop-blur-xl border-border rounded-xl">
                          {sections.length === 0 ? (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              Loading Sections...
                            </div>
                          ) : (
                            sections.map((sec) => (
                              <SelectItem
                                key={sec.id}
                                value={sec.sectionId}
                                className="rounded-lg cursor-pointer"
                              >
                                {sec.sectionName} ({sec.sectionId})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                  >
                    <Label
                      htmlFor="domainId"
                      className="text-muted-foreground text-sm font-medium"
                    >
                      {role === "ADMIN"
                        ? "Admin Username"
                        : "Institutional Domain ID"}
                    </Label>
                    <Input
                      id="domainId"
                      placeholder={
                        role === "ADMIN" ? "Admin" : "e.g. jdoe@institution.edu"
                      }
                      value={domainId}
                      onChange={(e) => setDomainId(e.target.value)}
                      required
                      autoFocus={role === "ADMIN"}
                      className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-12 rounded-xl px-4"
                    />
                  </motion.div>

                  {role === "ADMIN" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-3 pt-2"
                    >
                      <Label
                        htmlFor="adminOtp"
                        className="text-muted-foreground text-sm font-medium"
                      >
                        Master Password
                      </Label>
                      <Input
                        id="adminOtp"
                        type="password"
                        placeholder="Enter admin password"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-12 rounded-xl px-4"
                      />
                    </motion.div>
                  )}

                  {role !== "ADMIN" && (
                    <div className="pt-2 flex flex-col items-center">
                      <div className="relative w-full flex items-center justify-center mb-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground font-mono">
                            Or continue with
                          </span>
                        </div>
                      </div>

                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() =>
                          setErrorMsg("Google Sign-in popup closed or failed")
                        }
                        theme="filled_black"
                        text="continue_with"
                        width={300}
                        shape="pill"
                      />
                    </div>
                  )}
                </>
              )}

              {step === 2 && role !== "ADMIN" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                    <p className="text-muted-foreground text-sm mb-1">
                      Authenticating as
                    </p>
                    <p className="text-foreground font-medium">{domainId}</p>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-2 text-xs text-primary hover:opacity-80 underline transition-opacity"
                    >
                      Change Email
                    </button>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="otp"
                      className="text-muted-foreground text-sm font-medium"
                    >
                      {role === "ADMIN"
                        ? "Master Password"
                        : "6-Digit Secure OTP"}
                    </Label>
                    <Input
                      id="otp"
                      type="password"
                      placeholder={
                        role === "ADMIN"
                          ? "Enter admin password"
                          : "Enter code from email"
                      }
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      autoFocus
                      className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary h-12 rounded-xl px-4 text-center tracking-widest text-lg"
                    />
                  </div>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={
                  isLoading || (role !== "ADMIN" && sections.length === 0)
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 rounded-xl mt-4 text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                {isLoading
                  ? role === "ADMIN"
                    ? "Logging in..."
                    : step === 1
                      ? "Sending OTP..."
                      : "Verifying..."
                  : role === "ADMIN"
                    ? "Login"
                    : step === 1
                      ? "Send OTP Code"
                      : "Verify & Login"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
