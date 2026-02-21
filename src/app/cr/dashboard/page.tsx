"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function CRDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "global",
          title,
          description,
          deadline: new Date(deadline).toISOString(),
          type: "academic",
          priority: "high",
          status: "pending",
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setDeadline("");
        alert("Global Academic Task Posted Successfully!");
      } else {
        alert("Failed to post task. Are your Cosmos DB details configured?");
      }
    } catch (err) {
      console.error(err);
      alert("Error posting task.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 dark">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
              CR/IC Portal
            </h1>
            <p className="text-slate-400">
              Post academic tasks for all students
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

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6">Post New Global Task</h2>
          <form onSubmit={handlePostTask} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-slate-300">
                Task Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-black/30 border-white/20 text-white h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="desc" className="text-slate-300">
                Description (Optional)
              </Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-black/30 border-white/20 text-white h-12"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="deadline" className="text-slate-300">
                Deadline
              </Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="bg-black/30 border-white/20 text-white h-12 [color-scheme:dark]"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-lg shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              {isLoading ? "Posting..." : "Post Task to All Students"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
