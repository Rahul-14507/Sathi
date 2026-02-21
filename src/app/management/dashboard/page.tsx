"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ShieldAlert, PlusCircle, Users } from "lucide-react";

export default function ManagementDashboard() {
  const router = useRouter();

  const [sectionId, setSectionId] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [crId, setCrId] = useState("");
  const [studentEmails, setStudentEmails] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [existingSections, setExistingSections] = useState<any[]>([]);

  const fetchSections = () => {
    fetch("/api/sections")
      .then((res) => res.json())
      .then((data) => {
        setExistingSections(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Parse comma-separated emails
    const emailList = studentEmails
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_section",
          sectionId,
          sectionName,
          crId,
          domainIds: emailList,
        }),
      });

      if (res.ok) {
        alert(`Successfully created Section ${sectionName}!`);
        setSectionId("");
        setSectionName("");
        setCrId("");
        setStudentEmails("");
        fetchSections();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || "Failed to create section"}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 text-slate-100 p-8 dark">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              <ShieldAlert className="text-purple-400" />
              Management Platform
            </h1>
            <p className="text-slate-400 mt-1">
              Administer class sections and user roles
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Section Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <PlusCircle className="text-emerald-400" /> Register New Section
            </h2>
            <form onSubmit={handleCreateSection} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="sId" className="text-slate-300">
                  Section ID Format (e.g. CS-A)
                </Label>
                <Input
                  id="sId"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value.toUpperCase())}
                  required
                  placeholder="CS-A"
                  className="bg-black/30 border-white/20 text-white uppercase placeholder:normal-case"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sName" className="text-slate-300">
                  Display Name
                </Label>
                <Input
                  id="sName"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  required
                  placeholder="Computer Science Sec A"
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crId" className="text-slate-300">
                  CR / In-charge Domain ID
                </Label>
                <Input
                  id="crId"
                  type="email"
                  value={crId}
                  onChange={(e) => setCrId(e.target.value)}
                  required
                  placeholder="cr.john@domain.edu"
                  className="bg-black/30 border-white/20 text-white font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emails" className="text-slate-300">
                  Student Emails (comma separated)
                </Label>
                <textarea
                  id="emails"
                  value={studentEmails}
                  onChange={(e) => setStudentEmails(e.target.value)}
                  rows={4}
                  className="w-full bg-black/30 border-white/20 text-white rounded-md p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 border"
                  placeholder="student1@domain.edu, student2@domain.edu"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-purple-600 hover:bg-purple-500 text-md shadow-[0_0_20px_rgba(168,85,247,0.3)] mt-2 font-bold"
              >
                {isLoading ? "Provisioning..." : "Provision Section & Roles"}
              </Button>
            </form>
          </div>

          {/* Active Sections */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="text-blue-400" /> Active Sections
            </h2>

            {existingSections.length === 0 ? (
              <p className="text-slate-400 italic">No sections created yet.</p>
            ) : (
              <div className="space-y-4">
                {existingSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-slate-100">
                          {sec.sectionId}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {sec.sectionName}
                        </p>
                      </div>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
