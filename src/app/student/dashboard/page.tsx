"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isToday, isBefore, isAfter, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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
  MessageSquare,
  Presentation,
  TerminalSquare,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
  ExternalLink,
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
  const [lastSync, setLastSync] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(new Date());

  // Community Hub State
  const [activeTab, setActiveTab] = useState("tasks");
  const [searchQuery, setSearchQuery] = useState("");
  const [communityPosts, setCommunityPosts] = useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);

  // Community Post Form State
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postLink, setPostLink] = useState("");
  const [isPostingCommunity, setIsPostingCommunity] = useState(false);

  // Community Edit State
  const [editingCommunityPostId, setEditingCommunityPostId] = useState<
    string | null
  >(null);
  const [editCommunityTitle, setEditCommunityTitle] = useState("");
  const [editCommunityContent, setEditCommunityContent] = useState("");
  const [editCommunityLink, setEditCommunityLink] = useState("");

  // Setup minute-tick clock for Time-Aware logic
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Time Aware Logic Constants
  const currentHour = currentTime.getHours();
  const isClassHours = currentHour >= 9 && currentHour <= 16; // 9 AM to 4:59 PM
  const mockTimetable = [
    { time: "09:00 AM", subject: "Data Structures", room: "Room 401" },
    { time: "11:00 AM", subject: "Operating Systems", room: "Room 402" },
    { time: "02:00 PM", subject: "Machine Learning", room: "Room 305" },
  ];

  // Polling for CR Announcements
  useEffect(() => {
    if (!sectionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/notifications?sectionId=${encodeURIComponent(sectionId)}&lastSync=${lastSync}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.announcements && data.announcements.length > 0) {
            data.announcements.forEach((a: any) => {
              toast("Live CR Broadcast 📢", {
                description: a.message,
                duration: 10000,
              });
            });
            const maxTimestamp = Math.max(
              ...data.announcements.map((a: any) => a.timestamp),
            );
            setLastSync(maxTimestamp);
          }
        }
      } catch (err) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [sectionId, lastSync]);

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

  const fetchCommunityPosts = (category: string, search: string = "") => {
    if (category === "tasks") return; // Tasks are handled separately
    setCommunityLoading(true);
    let url = `/api/community?category=${encodeURIComponent(category)}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCommunityPosts(Array.isArray(data) ? data : []);
        setCommunityLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setCommunityLoading(false);
      });
  };

  useEffect(() => {
    fetchTasks();
  }, [userId, sectionId]);

  useEffect(() => {
    // Delay search triggering slightly (debounce)
    const timeoutId = setTimeout(() => {
      fetchCommunityPosts(activeTab, searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [activeTab, searchQuery]);

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

  const handleCreateCommunityPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPostingCommunity(true);
    try {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: activeTab,
          title: postTitle,
          content: postContent,
          link: postLink,
          authorId: userId,
          sectionId: sectionId,
        }),
      });
      if (res.ok) {
        setPostTitle("");
        setPostContent("");
        setPostLink("");
        toast.success("Post published to community!");
        fetchCommunityPosts(activeTab, searchQuery);
      } else {
        toast.error("Failed to publish post.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error.");
    } finally {
      setIsPostingCommunity(false);
    }
  };

  const handleVote = async (postId: string, action: "upvote" | "downvote") => {
    // Optimistic Update
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, upvotes: p.upvotes + (action === "upvote" ? 1 : -1) };
        }
        return p;
      }),
    );

    try {
      await fetch("/api/community/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          category: activeTab,
          action,
        }),
      });
      // We don't necessarily need to refetch immediately to preserve user view
    } catch (err) {
      console.error("Failed to vote:", err);
      // Revert optimistic update on failure by simply refetching
      fetchCommunityPosts(activeTab, searchQuery);
    }
  };

  const handleDeleteCommunityPost = async (post: any) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      setCommunityPosts((prev) => prev.filter((p) => p.id !== post.id));
      await fetch(
        `/api/community?id=${post.id}&category=${post.category}&authorId=${encodeURIComponent(userId || "")}`,
        {
          method: "DELETE",
        },
      );
      toast.success("Post deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post.");
    }
  };

  const startEditCommunityPost = (post: any) => {
    setEditingCommunityPostId(post.id);
    setEditCommunityTitle(post.title);
    setEditCommunityContent(post.content);
    setEditCommunityLink(post.link || "");
  };

  const saveEditCommunityPost = async (post: any) => {
    try {
      const updated = {
        ...post,
        title: editCommunityTitle,
        content: editCommunityContent,
        link: editCommunityLink,
        isEdited: true,
      };
      setCommunityPosts((prev) =>
        prev.map((p) => (p.id === post.id ? updated : p)),
      );
      setEditingCommunityPostId(null);

      const res = await fetch("/api/community", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          category: post.category,
          authorId: userId,
          title: editCommunityTitle,
          content: editCommunityContent,
          link: editCommunityLink,
        }),
      });
      if (res.ok) {
        toast.success("Post updated!");
      } else {
        toast.error("Failed to update post.");
        fetchCommunityPosts(activeTab, searchQuery);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating post.");
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
  const renderCommunityList = () => {
    if (communityLoading) {
      return (
        <div className="text-center py-10 text-slate-400 animate-pulse">
          Loading posts...
        </div>
      );
    }
    if (communityPosts.length === 0) {
      return (
        <div className="text-center py-10 text-slate-500 italic border border-white/5 rounded-2xl bg-white/5">
          No posts found in this category. Be the first!
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {communityPosts.map((post) => (
          <div
            key={post.id}
            className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 shadow-xl flex gap-4 transition-all hover:bg-slate-900"
          >
            {/* Voting Column */}
            <div className="flex flex-col items-center gap-1 min-w-[40px]">
              <button
                onClick={() => handleVote(post.id, "upvote")}
                className="text-slate-500 hover:text-emerald-400 transition-colors"
                title="Upvote"
              >
                <ArrowUpCircle className="w-6 h-6" />
              </button>
              <span
                className={`font-bold ${post.upvotes > 0 ? "text-emerald-400" : post.upvotes < 0 ? "text-red-400" : "text-slate-400"}`}
              >
                {post.upvotes || 0}
              </span>
              <button
                onClick={() => handleVote(post.id, "downvote")}
                className="text-slate-500 hover:text-red-400 transition-colors"
                title="Downvote"
              >
                <ArrowDownCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Content Column */}
            <div className="flex-1 space-y-2">
              {editingCommunityPostId === post.id ? (
                <div className="space-y-3">
                  <Input
                    value={editCommunityTitle}
                    onChange={(e) => setEditCommunityTitle(e.target.value)}
                    className="bg-black/30 border-white/20 text-slate-100"
                  />
                  <Input
                    value={editCommunityContent}
                    onChange={(e) => setEditCommunityContent(e.target.value)}
                    className="bg-black/30 border-white/20 text-slate-100"
                  />
                  {post.category !== "discussion" && (
                    <Input
                      value={editCommunityLink}
                      onChange={(e) => setEditCommunityLink(e.target.value)}
                      placeholder="Link (optional)"
                      className="bg-black/30 border-white/20 text-slate-100"
                    />
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => saveEditCommunityPost(post)}
                      className="bg-emerald-600 hover:bg-emerald-500"
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCommunityPostId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-xl text-slate-100">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-500 bg-black/40 px-2 py-1 rounded-full border border-white/5 flex items-center gap-1">
                        by {post.authorId}
                        {post.isEdited && (
                          <span className="text-slate-400 font-medium italic ml-1">
                            (edited)
                          </span>
                        )}
                      </div>
                      {post.authorId === userId && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEditCommunityPost(post)}
                            className="text-slate-500 hover:text-blue-400 p-1"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCommunityPost(post)}
                            className="text-slate-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>
                </>
              )}

              {/* Conditional Extras */}
              {post.link && (
                <div className="pt-2">
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20 transition-all hover:bg-blue-500/20"
                  >
                    <ExternalLink className="w-4 h-4" /> Open Resource Link
                  </a>
                </div>
              )}

              {post.category === "events" && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600 hover:text-white transition-all group"
                    onClick={() => {
                      setTitle(`Attend: ${post.title}`);
                      setDeadline(
                        new Date(Date.now() + 86400000 * 2).toISOString(),
                      ); // Default 2 days
                      setPriority("high");
                      setActiveTab("tasks"); // Switch to task tab to finalize
                      toast.success(
                        "Drafted task event! Set your deadline and click 'Add' to lock it in.",
                      );
                    }}
                  >
                    <Save className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />{" "}
                    Add to My Workload Schedule
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
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

        <Tabs
          defaultValue="tasks"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full sm:w-[800px] grid-cols-4 bg-white/5 border border-white/10 p-1 rounded-xl mx-auto mb-8">
            <TabsTrigger
              value="tasks"
              className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium"
            >
              My Tasks
            </TabsTrigger>
            <TabsTrigger
              value="discussion"
              className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium"
            >
              Discussion
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-medium"
            >
              Events
            </TabsTrigger>
            <TabsTrigger
              value="upskill"
              className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium text-xs sm:text-sm"
            >
              Upskill & Free Resources
            </TabsTrigger>
          </TabsList>

          {activeTab !== "tasks" && (
            <div className="mb-8 relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-black/40 border-white/20 text-white h-12 rounded-xl focus-visible:ring-indigo-500 placeholder:text-slate-500"
              />
            </div>
          )}

          {/* MAIN TASKS TAB WITH TIME-AWARE DASHBOARD VIEWER */}
          <TabsContent
            value="tasks"
            className="space-y-8 animate-in fade-in duration-500"
          >
            {isClassHours && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl mb-8">
                <h2 className="text-xl font-bold text-indigo-400 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Today's Timetable (Live)
                </h2>
                <div className="space-y-3">
                  {mockTimetable.map((slot, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 rounded-2xl bg-black/20 border border-white/5 hover:bg-black/40 transition-colors"
                    >
                      <span className="font-semibold text-slate-200">
                        {slot.time}
                      </span>
                      <span className="text-slate-300 font-medium">
                        {slot.subject}
                      </span>
                      <span className="text-indigo-300 text-sm font-mono bg-indigo-500/10 px-3 py-1 rounded-md border border-indigo-500/20">
                        {slot.room}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl mb-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-100">
                <PlusCircle className="w-5 h-5 text-indigo-400" /> Quick Add
                Task
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
                    Desc <span className="text-slate-500 text-xs">(opt)</span>
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
                  {posting ? "Adding..." : "Add"}
                </Button>
              </form>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full sm:w-[600px] grid-cols-3 bg-white/5 border border-white/10 p-1 rounded-xl">
                <TabsTrigger
                  value="all"
                  className="rounded-lg data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                >
                  All Workload
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
                    {overdue.length > 0 && (
                      <section>
                        <h2 className="text-xl font-bold text-red-400 flex items-center gap-2 mb-4">
                          <AlertCircle className="w-5 h-5" /> Overdue
                        </h2>
                        {renderTaskList(overdue, "No overdue tasks.", true)}
                      </section>
                    )}
                    {dueToday.length > 0 && (
                      <section>
                        <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-4">
                          <Calendar className="w-5 h-5" /> Due Today
                        </h2>
                        {renderTaskList(dueToday, "You're clear for today!")}
                      </section>
                    )}
                    <section>
                      <h2 className="text-xl font-bold text-slate-300 flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5" /> Upcoming
                      </h2>
                      {renderTaskList(upcoming, "Nothing on the horizon.")}
                    </section>
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
          </TabsContent>

          {/* DISCUSSION DISCOVERY TAB */}
          <TabsContent
            value="discussion"
            className="space-y-8 animate-in fade-in duration-500"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl mb-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-purple-400">
                <MessageSquare className="w-5 h-5 text-purple-400" /> Start a
                Discussion
              </h2>
              <form onSubmit={handleCreateCommunityPost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Topic Title</Label>
                    <Input
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g. Help with Chapter 4 algorithms?"
                      className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Description</Label>
                    <Input
                      required
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your thoughts or ask a question..."
                      className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-purple-500"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isPostingCommunity}
                  className="bg-purple-600 hover:bg-purple-500 h-10 px-8 text-white font-medium shadow-[0_0_15px_rgba(147,51,234,0.2)]"
                >
                  {isPostingCommunity ? "Posting..." : "Post Discussion"}
                </Button>
              </form>
            </div>

            {renderCommunityList()}
          </TabsContent>

          {/* EVENTS HUB TAB */}
          <TabsContent
            value="events"
            className="space-y-6 animate-in fade-in duration-500"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl mb-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-emerald-400">
                <Presentation className="w-5 h-5 text-emerald-400" /> Post a
                Campus Event or Hackathon
              </h2>
              <form onSubmit={handleCreateCommunityPost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Event Name</Label>
                    <Input
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g. Spring AI Hackathon"
                      className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      Details (Time & Location)
                    </Label>
                    <Input
                      required
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="e.g. March 10th at Main Auditorium"
                      className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      Registration Link{" "}
                      <span className="text-xs text-slate-500">(opt)</span>
                    </Label>
                    <Input
                      value={postLink}
                      onChange={(e) => setPostLink(e.target.value)}
                      placeholder="https://..."
                      className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isPostingCommunity}
                  className="bg-emerald-600 hover:bg-emerald-500 h-10 px-8 text-white font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  {isPostingCommunity ? "Posting..." : "Share Event"}
                </Button>
              </form>
            </div>

            {renderCommunityList()}
          </TabsContent>

          {/* ROADMAPS & UPSKILL TAB */}
          <TabsContent
            value="upskill"
            className="space-y-8 animate-in fade-in duration-500"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl mb-8">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-blue-400">
                <TerminalSquare className="w-5 h-5 text-blue-400" /> Share a
                Free Resource or Ask a Question
              </h2>
              <form onSubmit={handleCreateCommunityPost} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Title</Label>
                    <Input
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g. Free React Course"
                      className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Description</Label>
                    <Input
                      required
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Why is it helpful?"
                      className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      Resource Link{" "}
                      <span className="text-xs text-slate-500">(opt)</span>
                    </Label>
                    <Input
                      value={postLink}
                      onChange={(e) => setPostLink(e.target.value)}
                      placeholder="https://..."
                      className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isPostingCommunity}
                  className="bg-blue-600 hover:bg-blue-500 h-10 px-8 text-white font-medium shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                >
                  {isPostingCommunity ? "Posting..." : "Share Resource"}
                </Button>
              </form>
            </div>

            {renderCommunityList()}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
