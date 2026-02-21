"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isBefore, isAfter, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function StudentDashboard() {
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks?userId=student_123")
      .then((res) => res.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const now = new Date();

  const categorizeTasks = (taskList: any[]) => {
    const upcoming = taskList.filter(
      (t) =>
        t.status === "pending" &&
        isAfter(new Date(t.deadline), startOfDay(now)) &&
        !isToday(new Date(t.deadline)),
    );
    const dueToday = taskList.filter(
      (t) => t.status === "pending" && isToday(new Date(t.deadline)),
    );
    const overdue = taskList.filter(
      (t) =>
        t.status === "pending" &&
        isBefore(new Date(t.deadline), startOfDay(now)),
    );
    return { upcoming, dueToday, overdue };
  };

  const academicTasks = tasks.filter((t) => t.type === "academic");
  const personalTasks = tasks.filter((t) => t.type === "personal");

  const renderTaskList = (
    list: any[],
    isEmptyMessage: string,
    isOverdue: boolean = false,
  ) => {
    if (list.length === 0)
      return (
        <div className="text-slate-500 italic py-4 pl-2">{isEmptyMessage}</div>
      );
    return (
      <div className="space-y-4 mt-4">
        {list.map((task) => (
          <div
            key={task.id}
            className={`p-5 rounded-2xl border backdrop-blur-md flex justify-between items-start transition-all ${isOverdue ? "bg-red-950/30 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : task.type === "academic" ? "bg-blue-950/20 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]" : "bg-white/5 border-white/10"}`}
          >
            <div>
              <h3
                className={`font-semibold text-lg flex items-center gap-2 ${isOverdue ? "text-red-400" : "text-slate-100"}`}
              >
                {isOverdue && <AlertCircle className="w-5 h-5 text-red-500" />}
                {task.title}
                {task.type === "academic" && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                    Academic
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
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-emerald-500/20 hover:text-emerald-400 rounded-full text-slate-500 border border-slate-700"
            >
              <CheckCircle2 className="w-5 h-5" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
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
            className="border-white/20 text-white hover:bg-white/10 hidden md:flex"
          >
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="academic" className="w-full">
          <TabsList className="grid w-[400px] grid-cols-2 bg-white/5 border border-white/10 p-1 rounded-xl">
            <TabsTrigger
              value="academic"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Academic Tasks
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              Personal Tasks
            </TabsTrigger>
          </TabsList>

          {["academic", "personal"].map((type) => {
            const currentList =
              type === "academic" ? academicTasks : personalTasks;
            const { upcoming, dueToday, overdue } =
              categorizeTasks(currentList);
            return (
              <TabsContent
                key={type}
                value={type}
                className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
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
                <section>
                  <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5" /> Due Today
                  </h2>
                  {renderTaskList(dueToday, "You're clear for today!")}
                </section>

                {/* Upcoming Section */}
                <section>
                  <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5" /> Upcoming
                  </h2>
                  {renderTaskList(upcoming, "Nothing on the horizon.")}
                </section>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </main>
  );
}
