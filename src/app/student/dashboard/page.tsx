"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import confetti from "canvas-confetti";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isToday, isBefore, isAfter, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Settings,
  Sparkles,
  Upload,
  Bot,
  Send,
  MailWarning,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function StudentDashboardContent() {
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

  // Profile State
  const [profileName, setProfileName] = useState("");
  const [profileSecondaryEmail, setProfileSecondaryEmail] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [deleteConfirmTask, setDeleteConfirmTask] = useState<any>(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState<any>(null);

  // AI Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [isScanningExtended, setIsScanningExtended] = useState(false);

  // AI Discussion Assistant State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

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

  const fetchProfile = async () => {
    if (!userId || !sectionId) return;
    try {
      const res = await fetch(
        `/api/users/profile?email=${encodeURIComponent(userId)}&sectionId=${encodeURIComponent(sectionId)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setProfileName(data.name || "");
        setProfileSecondaryEmail(data.secondaryEmail || "");
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userId,
          sectionId,
          name: profileName,
          secondaryEmail: profileSecondaryEmail,
        }),
      });
      if (res.ok) {
        toast.success("Profile updated successfully!");
        fetchProfile(); // refresh
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Network error updating profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProfile();
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

      // 🎉 Confetti celebration!
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#6366f1", "#8b5cf6", "#a78bfa", "#10b981", "#34d399"],
      });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG/JPG) of your syllabus.");
      return;
    }

    setIsScanningExtended(false);
    setIsScanning(true);
    toast.info("Analyzing syllabus with AI...");
    const timeoutId = setTimeout(() => setIsScanningExtended(true), 5000);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;

        const res = await fetch("/api/ai/scan-syllabus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64Image,
            userId: userId,
          }),
        });

        const data = await res.json();

        clearTimeout(timeoutId);
        setIsScanningExtended(false);

        if (res.ok && data.success) {
          toast.success(
            `Magic Sync! Auto-added ${data.count} tasks from syllabus.`,
          );
          fetchTasks(); // Reload tasks immediately
        } else {
          toast.error(data.error || "Failed to scan syllabus.");
        }
        setIsScanning(false);
      };

      reader.onerror = () => {
        clearTimeout(timeoutId);
        setIsScanningExtended(false);
        toast.error("Failed to read image file.");
        setIsScanning(false);
      };
    } catch (err) {
      clearTimeout(timeoutId);
      setIsScanningExtended(false);
      console.error(err);
      toast.error("Error connecting to AI service.");
      setIsScanning(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    const userQuery = aiQuery;
    setAiQuery("");
    setAiMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setIsAiTyping(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userQuery,
          userId: userId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
        if (data.postDrafted) {
          toast.success(
            "AI couldn't find an exact match, but drafted a new post for you!",
          );
          fetchCommunityPosts("discussion", ""); // reload to show new drafted post
          setActiveTab("discussion"); // force user to see it
        }
      } else {
        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Failed to get an answer.",
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error communicating with AI." },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleTriggerCron = async () => {
    toast.info("Triggering 24-hr reminder scan...");
    try {
      const res = await fetch("/api/cron/reminders");
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Cron executed successfully.");
      } else {
        toast.error(data.error || "Failed to trigger cron.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error triggering cron.");
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

  const executeDeleteTask = async () => {
    if (!deleteConfirmTask) return;
    const task = deleteConfirmTask;
    setDeleteConfirmTask(null);
    try {
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      await fetch(`/api/tasks?id=${task.id}&userId=${task.userId}`, {
        method: "DELETE",
      });
      toast.success("Task deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete task.");
    }
  };

  const handleDeleteTask = (task: any) => {
    setDeleteConfirmTask(task);
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
          sourceEventId:
            activeTab === "events" ? title.replace("Attend: ", "") : undefined, // Quick hack to tie events to tasks
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
    if (!userId) {
      toast.error("You must be logged in to vote.");
      return;
    }

    const voteValue = action === "upvote" ? 1 : -1;

    // Optimistic Update
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newVotes = { ...(p.votes || {}), [userId]: voteValue };
          const newTotal = Object.values(newVotes).reduce(
            (sum: number, val: any) => sum + (val as number),
            0,
          );
          return {
            ...p,
            votes: newVotes,
            upvotes: newTotal,
          };
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
          userId, // payload for the backend map
        }),
      });
      // We don't necessarily need to refetch immediately to preserve user view
    } catch (err) {
      console.error("Failed to vote:", err);
      toast.error("Failed to register vote.");
      // Revert optimistic update on failure by simply refetching
      fetchCommunityPosts(activeTab, searchQuery);
    }
  };

  const executeDeleteCommunityPost = async () => {
    if (!deleteConfirmPost) return;
    const post = deleteConfirmPost;
    setDeleteConfirmPost(null);
    try {
      setCommunityPosts((prev) => prev.filter((p) => p.id !== post.id));
      await fetch(
        `/api/community?id=${post.id}&category=${post.category}&authorId=${encodeURIComponent(userId || "")}`,
        {
          method: "DELETE",
        },
      );
      toast.success("Discussion post deleted.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post.");
    }
  };

  const handleDeleteCommunityPost = (post: any) => {
    setDeleteConfirmPost(post);
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

              {post.category === "events" &&
                (() => {
                  const isScheduled = tasks.find(
                    (t) => t.sourceEventId === post.title,
                  );
                  if (isScheduled) {
                    return (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all font-medium"
                          onClick={() => handleDeleteTask(isScheduled)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Undo Schedule
                        </Button>
                      </div>
                    );
                  }

                  return (
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
                  );
                })()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Stats computation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t: any) => t.status === "completed",
  ).length;
  const overdueTasks = tasks.filter(
    (t: any) =>
      t.status === "pending" &&
      isBefore(new Date(t.deadline), startOfDay(new Date())),
  ).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading)
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 text-slate-100 p-4 md:p-8 dark">
        <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex justify-between items-end pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/10" />
              <div>
                <div className="h-8 w-64 bg-white/10 rounded-lg mb-2" />
                <div className="h-4 w-48 bg-white/5 rounded-lg" />
              </div>
            </div>
            <div className="h-10 w-24 bg-white/10 rounded-lg" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white/5 border border-white/10"
              />
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="h-12 w-[600px] bg-white/5 rounded-xl mx-auto" />

          {/* Cards Skeleton */}
          <div className="h-40 rounded-3xl bg-white/5 border border-white/10" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white/5 border border-white/10"
              />
            ))}
          </div>
        </div>
      </div>
    );

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 text-slate-100 p-4 md:p-8 dark">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex justify-between items-end pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg hover:scale-105 transition-transform border-2 border-indigo-400">
                    {(profileName || userId || "S")[0].toUpperCase()}
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-slate-900 border border-indigo-500/20 text-slate-100">
                  <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      <Settings className="w-5 h-5 text-indigo-400" /> Profile
                      Settings
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleUpdateProfile}
                    className="space-y-6 mt-4"
                  >
                    <div className="space-y-4">
                      <div>
                        <Label className="text-slate-300 text-sm font-semibold mb-2 block">
                          Domain Email (Primary)
                        </Label>
                        <Input
                          disabled
                          value={userId || ""}
                          className="bg-black/30 border-white/10 text-slate-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-500 mt-2">
                          Your primary domain email cannot be changed.
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm font-semibold mb-2 block">
                          Full Name
                        </Label>
                        <Input
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-300 text-sm font-semibold mb-2 block">
                          Secondary Email (Alerts)
                        </Label>
                        <Input
                          type="email"
                          value={profileSecondaryEmail}
                          onChange={(e) =>
                            setProfileSecondaryEmail(e.target.value)
                          }
                          placeholder="e.g. personal@gmail.com"
                          className="bg-black/30 border-white/20 text-slate-100 focus-visible:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white w-full"
                    >
                      {isUpdatingProfile
                        ? "Saving Changes..."
                        : "Save Preferences"}
                    </Button>
                  </form>

                  <div className="mt-8 border-t border-white/10 pt-6">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      <MailWarning className="w-4 h-4 text-amber-500" /> Admin
                      Tools
                    </h3>
                    <Button
                      onClick={handleTriggerCron}
                      variant="outline"
                      className="w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
                    >
                      Force Trigger Daily Email Reminders
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div>
                <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                  Welcome back, {profileName || userId?.split("@")[0]}
                </h1>
                <p className="text-slate-400 mt-1">
                  Manage your academic and personal workload intelligently.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Sign Out
            </Button>
          </div>

          {/* 📊 Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-indigo-400">{totalTasks}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Total Tasks
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-emerald-400">
                {completedTasks}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Completed
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-3xl font-bold text-red-400">{overdueTasks}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Overdue</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-center relative overflow-hidden">
              <p className="text-3xl font-bold text-amber-400">
                {completionRate}%
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Completion Rate
              </p>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
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
                className="rounded-lg data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium text-xs sm:text-sm"
              >
                My Tasks
              </TabsTrigger>
              <TabsTrigger
                value="discussion"
                className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white font-medium text-xs sm:text-sm"
              >
                Discussion
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="rounded-lg data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-medium text-xs sm:text-sm"
              >
                Events
              </TabsTrigger>
              <TabsTrigger
                value="upskill"
                className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white font-medium text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis"
              >
                Resources
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-100">
                    <PlusCircle className="w-5 h-5 text-indigo-400" /> Quick Add
                    Task
                  </h2>

                  {/* AI Auto-Magic UI */}
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="syllabus-upload"
                      disabled={isScanning}
                    />
                    <Label
                      htmlFor="syllabus-upload"
                      className={`cursor-pointer flex flex-col items-center justify-center min-w-[160px] gap-1 px-4 py-2 rounded-lg font-medium shadow-lg transition-all border border-purple-500/30
                        ${isScanning ? "bg-purple-900/50 text-purple-300" : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white"}`}
                    >
                      <div className="flex items-center gap-2">
                        {isScanning ? (
                          <>
                            <Sparkles className="w-4 h-4 animate-spin-slow" />{" "}
                            {isScanningExtended
                              ? "Reading your syllabus... 🧠"
                              : "Scanning..."}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />{" "}
                            Auto-Magic Sync
                          </>
                        )}
                      </div>
                      {isScanning && isScanningExtended && (
                        <div className="w-full h-1 bg-purple-950 rounded-full overflow-hidden mt-1 relative">
                          <div className="absolute inset-y-0 left-0 bg-purple-400 w-1/3 rounded-full animate-[ping_1s_ease-in-out_infinite]"></div>
                        </div>
                      )}
                    </Label>
                  </div>
                </div>

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
                <form
                  onSubmit={handleCreateCommunityPost}
                  className="space-y-4"
                >
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
                <form
                  onSubmit={handleCreateCommunityPost}
                  className="space-y-4"
                >
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
                <form
                  onSubmit={handleCreateCommunityPost}
                  className="space-y-4"
                >
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

          {/* AI Assistant Floating Action Button (FAB) relative to Community Tabs */}
          {activeTab !== "tasks" && (
            <div className="fixed bottom-8 right-8 z-50">
              <Button
                onClick={() => setShowAIAssistant(true)}
                className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/30 flex items-center justify-center group"
              >
                <Bot className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          )}

          {/* AI Assistant Chat Modal */}
          <Dialog open={showAIAssistant} onOpenChange={setShowAIAssistant}>
            <DialogContent className="bg-slate-900 border-white/10 sm:max-w-[500px] text-slate-100 p-0 overflow-hidden shadow-2xl">
              <div className="bg-indigo-900/40 p-6 border-b border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">
                    Sathi AI Assistant
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Ask a question about your courses or community.
                  </DialogDescription>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {aiMessages.length === 0 && !isAiTyping && (
                  <div className="text-center py-8 text-slate-500">
                    <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>
                      I can search past discussions, events, and resources to
                      find answers or draft a new post for you.
                    </p>
                  </div>
                )}

                {aiMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="w-4 h-4 text-indigo-400" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl p-4 text-sm whitespace-pre-wrap max-w-[80%] ${msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white/5 border border-white/10 text-slate-300 rounded-tl-sm"}`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-300 prose prose-invert max-w-none flex items-center gap-1">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleAskAI}
                className="p-4 bg-black/40 border-t border-white/5"
              >
                <div className="relative">
                  <Input
                    disabled={isAiTyping}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask the AI Assistant..."
                    className="pr-12 bg-white/5 border-white/10 text-white focus-visible:ring-indigo-500 rounded-xl h-12"
                  />
                  <Button
                    type="submit"
                    disabled={isAiTyping || !aiQuery.trim()}
                    size="icon"
                    className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <AlertDialog
        open={!!deleteConfirmTask}
        onOpenChange={(open) => !open && setDeleteConfirmTask(null)}
      >
        <AlertDialogContent className="bg-slate-900 border border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Task?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to permanently delete "
              {deleteConfirmTask?.title}" from your workload?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-white border-slate-700 hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteTask}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              Delete Workload
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteConfirmPost}
        onOpenChange={(open) => !open && setDeleteConfirmPost(null)}
      >
        <AlertDialogContent className="bg-slate-900 border border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Community Post?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to permanently delete "
              {deleteConfirmPost?.title}"? This will remove all upvotes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-white border-slate-700 hover:bg-slate-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeDeleteCommunityPost}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              Delete Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#020817] flex items-center justify-center text-white">
          Loading Sathi Student Hub...
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}
