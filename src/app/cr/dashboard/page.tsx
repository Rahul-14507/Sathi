"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Clock, Users, Trash2, Edit2, Save, X, BellRing } from "lucide-react";

export default function CRDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [remindingTaskId, setRemindingTaskId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("sectionId");

  // Edit State
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  const fetchTasks = () => {
    if (!sectionId) {
      router.push("/auth?role=cr");
      return;
    }
    fetch(`/api/tasks?sectionId=${encodeURIComponent(sectionId)}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setTasksLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setTasksLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [sectionId]);

  const handleDeleteTask = async (task: any) => {
    if (
      !confirm("Are you sure you want to completely delete this global task?")
    )
      return;
    try {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      await fetch(`/api/tasks?id=${task.id}&userId=${task.userId}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (task: any) => {
    setEditTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDeadline(task.deadline);
  };

  const cancelEdit = () => {
    setEditTaskId(null);
  };

  const saveEdit = async (task: any) => {
    try {
      const updated = {
        ...task,
        title: editTitle,
        description: editDescription,
        deadline: new Date(editDeadline).toISOString(),
      };
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      setEditTaskId(null);
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBroadcasting(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId,
          message: broadcastMsg,
          authorId: "CR/IC",
        }),
      });
      if (res.ok) {
        setBroadcastMsg("");
        alert("Broadcast sent successfully!");
      } else {
        alert("Failed to send broadcast");
      }
    } catch (err) {
      console.error(err);
      alert("Error broadcasting");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleRemind = async (task: any) => {
    if (
      !confirm(
        `Send an email reminder to all students in Section ${sectionId} for "${task.title}"?`,
      )
    )
      return;

    setRemindingTaskId(task.id);
    try {
      const res = await fetch("/api/tasks/remind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: task.id,
          sectionId: sectionId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Reminder sent successfully!");
      } else {
        alert(`Failed to send reminder: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending reminder blast.");
    } finally {
      setRemindingTaskId(null);
    }
  };

  const handlePostTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: `section:${sectionId}`,
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
        fetchTasks();
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
              Post academic tasks for Section {sectionId} students
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
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" /> Broadcast Live
            Announcement
          </h2>
          <form onSubmit={handleBroadcast} className="flex gap-4">
            <Input
              value={broadcastMsg}
              onChange={(e) => setBroadcastMsg(e.target.value)}
              required
              placeholder="e.g. Room changed to 402 for Data Structures!"
              className="bg-black/30 border-white/20 text-white h-12 flex-1"
            />
            <Button
              type="submit"
              disabled={isBroadcasting}
              className="h-12 bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)] px-8"
            >
              {isBroadcasting ? "Sending..." : "Notify Section"}
            </Button>
          </form>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold mb-6">
            Post New Task to Section {sectionId}
          </h2>
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
              {isLoading ? "Posting..." : `Post Task to Section ${sectionId}`}
            </Button>
          </form>
        </div>

        {/* Section Tasks History */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl mt-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Currently Assigned to
            Section {sectionId}
          </h2>

          {tasksLoading ? (
            <p className="text-slate-400 italic">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="text-slate-400 italic">
              No academic tasks have been assigned to Section {sectionId} yet.
            </p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => {
                const isEditing = editTaskId === task.id;

                if (isEditing) {
                  return (
                    <div
                      key={task.id}
                      className="p-5 rounded-2xl bg-slate-900/50 border border-slate-700/50 shadow-xl space-y-4"
                    >
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-black/30 border-white/20 text-white"
                        placeholder="Title"
                      />
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="bg-black/30 border-white/20 text-white"
                        placeholder="Description"
                      />
                      <Input
                        type="datetime-local"
                        value={editDeadline.slice(0, 16)}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="bg-black/30 border-white/20 text-white [color-scheme:dark]"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          onClick={cancelEdit}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                        <Button
                          onClick={() => saveEdit(task)}
                          className="bg-emerald-600 hover:bg-emerald-500"
                        >
                          <Save className="w-4 h-4 mr-2" /> Save
                        </Button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={task.id}
                    className="p-5 rounded-2xl bg-slate-900/50 border border-slate-700/50 flex justify-between items-start"
                  >
                    <div className="flex-1 pr-4">
                      <h3 className="font-semibold text-lg text-slate-100 flex items-center gap-2">
                        {task.title}
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 text-emerald-300 relative top-[-1px]">
                          Sec {sectionId}
                        </span>
                      </h3>
                      {task.description && (
                        <p className="text-slate-400 text-sm mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-3 font-medium">
                        <Clock className="w-4 h-4" />
                        {task.deadline &&
                        !isNaN(new Date(task.deadline).getTime())
                          ? format(new Date(task.deadline), "PPp")
                          : "No deadline"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemind(task)}
                        disabled={remindingTaskId === task.id}
                        className="hover:bg-amber-500/20 hover:text-amber-400 rounded-full text-slate-500 border border-slate-700 h-8 w-8 transition-colors"
                        title="Ping Class with Reminder"
                      >
                        <BellRing
                          className={`w-4 h-4 ${remindingTaskId === task.id ? "animate-pulse" : ""}`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(task)}
                        className="hover:bg-blue-500/20 hover:text-blue-400 rounded-full text-slate-500 border border-slate-700 h-8 w-8"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task)}
                        className="hover:bg-red-500/20 hover:text-red-400 rounded-full text-slate-500 border border-slate-700 h-8 w-8"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
