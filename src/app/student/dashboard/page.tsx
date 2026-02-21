"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isToday, isBefore, isAfter, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  PlusCircle,
  RotateCcw,
  Trash2,
  Edit2,
  Save,
  X,
} from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("sectionId");
  const userId = searchParams.get("userId");
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Personal Task Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");
  const [posting, setPosting] = useState(false);

  // Edit State
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editPriority, setEditPriority] = useState("medium");

  const fetchTasks = () => {
    if (!userId || !sectionId) {
      router.push("/auth?role=student");
      return;
    }
    fetch(
      `/api/tasks?userId=${encodeURIComponent(userId)}&sectionId=${encodeURIComponent(sectionId)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [userId, sectionId]);

  const handleCompleteTask = async (task: any) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "completed" } : t)),
      );
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          userId: task.userId,
          status: "completed",
        }),
      });
    } catch (err) {
      console.error("Failed to complete task:", err);
    }
  };

  const handleUndoTask = async (task: any) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "pending" } : t)),
      );
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          userId: task.userId,
          status: "pending",
        }),
      });
    } catch (err) {
      console.error("Failed to undo task:", err);
    }
  };

  const handleDeleteTask = async (task: any) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
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
    setEditPriority(task.priority || "medium");
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
        priority: editPriority,
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

  const handlePostPersonalTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setPosting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId, // mock logged in student id
          title,
          description,
          deadline: new Date(deadline).toISOString(),
          type: "personal",
          priority: priority,
          status: "pending",
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setDeadline("");
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const now = new Date();

  const sortTasks = (taskList: any[]) => {
    return [...taskList].sort((a, b) => {
      // Academic first
      if (a.type === "academic" && b.type !== "academic") return -1;
      if (a.type !== "academic" && b.type === "academic") return 1;
      // Then by deadline
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });
  };

  const categorizeTasks = (taskList: any[]) => {
    const sortedList = sortTasks(taskList);
    const upcoming = sortedList.filter(
      (t) =>
        t.status === "pending" &&
        isAfter(new Date(t.deadline), startOfDay(now)) &&
        !isToday(new Date(t.deadline)),
    );
    const dueToday = sortedList.filter(
      (t) => t.status === "pending" && isToday(new Date(t.deadline)),
    );
    const overdue = sortedList.filter(
      (t) =>
        t.status === "pending" &&
        isBefore(new Date(t.deadline), startOfDay(now)),
    );
    const completed = sortedList.filter((t) => t.status === "completed");
    return { upcoming, dueToday, overdue, completed };
  };

  const academicTasks = tasks.filter((t) => t.type === "academic");
  const personalTasks = tasks.filter((t) => t.type === "personal");
  const allTasks = tasks;

  const renderTaskList = (
    list: any[],
    isEmptyMessage: string,
    isOverdue: boolean = false,
    isCompleted: boolean = false,
  ) => {
    if (list.length === 0)
      return (
        <div className="text-slate-500 italic py-4 pl-2">{isEmptyMessage}</div>
      );
    return (
      <div className="space-y-4 mt-4">
        {list.map((task) => {
          const isEditing = editTaskId === task.id;

          if (isEditing) {
            return (
              <div
                key={task.id}
                className="p-5 rounded-2xl border backdrop-blur-md bg-white/10 border-white/20 shadow-xl space-y-4"
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
                <div className="flex gap-4">
                  <Input
                    type="datetime-local"
                    value={editDeadline.slice(0, 16)}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="bg-black/30 border-white/20 text-white flex-1 [color-scheme:dark]"
                  />
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="bg-black/30 border-white/20 text-white rounded-md px-3 flex-1 h-10 outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
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
                    className="bg-blue-600 hover:bg-blue-500"
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
              className={`p-5 rounded-2xl border backdrop-blur-md flex justify-between items-start transition-all ${
                isCompleted
                  ? "bg-slate-900/50 border-slate-800 opacity-60 grayscale"
                  : isOverdue
                    ? "bg-red-950/30 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : task.type === "academic"
                      ? "bg-blue-950/20 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]"
                      : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex-1 pr-4">
                <h3
                  className={`font-semibold text-lg flex items-center gap-2 flex-wrap ${isOverdue ? "text-red-400" : "text-slate-100"}`}
                >
                  {isOverdue && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {task.title}
                  {task.type === "academic" && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30 relative top-[-1px]">
                      Academic
                    </span>
                  )}
                  {task.type === "personal" && (
                    <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30 relative top-[-1px]">
                      Personal
                    </span>
                  )}
                  {task.priority && (
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border relative top-[-1px] ${
                        task.priority === "high"
                          ? "text-red-400 bg-red-400/10 border-red-400/20"
                          : task.priority === "medium"
                            ? "text-amber-400 bg-amber-400/10 border-amber-400/20"
                            : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                      }`}
                    >
                      {task.priority}
                    </span>
                  )}
                </h3>
                {task.description && (
                  <p className="text-slate-400 text-sm mt-1">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-3 font-medium">
                  <Clock className="w-4 h-4" />
                  {task.deadline && !isNaN(new Date(task.deadline).getTime())
                    ? format(new Date(task.deadline), "PPp")
                    : "No proper deadline"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!isCompleted ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCompleteTask(task)}
                    className="hover:bg-emerald-500/20 hover:text-emerald-400 rounded-full text-slate-500 border border-slate-700 h-8 w-8"
                    title="Complete"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUndoTask(task)}
                    className="hover:bg-slate-700/50 hover:text-slate-300 rounded-full text-slate-500 border border-slate-700 transition-all pointer-events-auto filter-none opacity-100 h-8 w-8"
                    title="Undo"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                )}
                {task.type !== "academic" && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white dark">
        Loading Dashboard...
      </div>
    );

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 text-slate-100 p-4 md:p-8 dark">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-end pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Student Hub
            </h1>
            <p className="text-slate-400 mt-1">
              Manage your academic and personal workload intelligently.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full sm:w-[600px] grid-cols-3 bg-white/5 border border-white/10 p-1 rounded-xl">
            <TabsTrigger
              value="all"
              className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white"
            >
              All Tasks
            </TabsTrigger>
            <TabsTrigger
              value="academic"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Academic
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Personal
            </TabsTrigger>
          </TabsList>

          {["all", "academic", "personal"].map((type) => {
            const currentList =
              type === "academic"
                ? academicTasks
                : type === "personal"
                  ? personalTasks
                  : allTasks;

            const { upcoming, dueToday, overdue, completed } =
              categorizeTasks(currentList);

            return (
              <TabsContent
                key={type}
                value={type}
                className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                {/* Personal Add Task Form (Only in Personal Tab) */}
                {type === "personal" && (
                  <div className="mb-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-100">
                      <PlusCircle className="w-5 h-5 text-indigo-400" /> Add
                      Personal Task
                    </h2>
                    <form
                      onSubmit={handlePostPersonalTask}
                      className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
                    >
                      <div className="space-y-2 md:col-span-1">
                        <Label className="text-slate-300">Title</Label>
                        <Input
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label className="text-slate-300">
                          Desc{" "}
                          <span className="text-slate-500 text-xs">(opt)</span>
                        </Label>
                        <Input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label className="text-slate-300">Deadline</Label>
                        <Input
                          required
                          type="datetime-local"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-indigo-500 [color-scheme:dark]"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label className="text-slate-300">Priority</Label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full bg-black/30 border border-white/20 text-slate-100 focus-visible:ring-indigo-500 h-10 rounded-md px-3 outline-none"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <Button
                        type="submit"
                        disabled={posting}
                        className="md:col-span-1 bg-indigo-600 hover:bg-indigo-500 h-10 w-full text-white font-medium shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                      >
                        {posting ? "Adding..." : "Add to Schedule"}
                      </Button>
                    </form>
                  </div>
                )}

                {/* Overdue Section */}
                {overdue.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5" /> Overdue
                    </h2>
                    {renderTaskList(overdue, "No overdue tasks.", true)}
                  </section>
                )}

                {/* Due Today Section */}
                {dueToday.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5" /> Due Today
                    </h2>
                    {renderTaskList(dueToday, "You're clear for today!")}
                  </section>
                )}

                {/* Upcoming Section */}
                <section>
                  <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5" /> Upcoming
                  </h2>
                  {renderTaskList(upcoming, "Nothing on the horizon.")}
                </section>

                {/* Completed Section */}
                {completed.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-emerald-500/70 flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5" /> Completed
                    </h2>
                    {renderTaskList(
                      completed,
                      "No completed tasks.",
                      false,
                      true,
                    )}
                  </section>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </main>
  );
}
