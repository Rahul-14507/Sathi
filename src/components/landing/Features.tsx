import { motion } from "framer-motion";
import {
  Calendar,
  MessageCircle,
  Trophy,
  Bot,
  CheckCheck,
  Clock,
  Zap,
} from "lucide-react";

const features = [
  {
    num: "01",
    title: "Intelligent Dashboard",
    icon: Calendar,
    color: "text-blue-500",
    colorBg: "bg-blue-500/10",
    description:
      "Shows upcoming classes during college hours, switches to tasks and deadlines after. Academics always on top — no toggling, no settings.",
    tags: ["Smart priority", "Timetable aware", "Deadline tracking"],
  },
  {
    num: "02",
    title: "Community Discussions",
    icon: MessageCircle,
    color: "text-emerald-500",
    colorBg: "bg-emerald-500/10",
    description:
      "Ask doubts, get answers, save the good ones. Upvoted answers train the AI — so the more your batch uses it, the smarter it gets.",
    tags: ["Academic Q&A", "Upvoting", "Saved answers"],
  },
  {
    num: "03",
    title: "Hackathons & Events",
    icon: Trophy,
    color: "text-amber-500",
    colorBg: "bg-amber-500/10",
    description:
      "Peer-listed hackathons, workshops, and campus events with registration countdowns. Get email reminders before the deadline, not after.",
    tags: ["Peer listed", "Email alerts", "One-click register"],
  },
  {
    num: "04",
    title: "AI Study Companion",
    icon: Bot,
    color: "text-violet-500",
    colorBg: "bg-violet-500/10",
    description:
      "Upload a syllabus image and let GPT-4o Vision auto-extract every deadline. Ask the AI chatbot anything — it searches community posts via RAG to give you real answers.",
    tags: ["GPT-4o Vision", "RAG Chatbot", "Auto-Sync"],
  },
];

const highlights = [
  { icon: CheckCheck, text: "Email reminders 24h before every deadline" },
  { icon: Clock, text: "Real-time timetable sync from CR updates" },
  { icon: Zap, text: "Push notifications for class cancellations" },
];

export function Features() {
  return (
    <section className="py-24 bg-card border-y border-border">
      <div className="max-w-6xl mx-auto px-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">
              What's inside
            </p>
            <h2 className="text-3xl md:text-4xl text-foreground tracking-tight">
              Not just another to-do app.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-2"
          >
            {highlights.map((h) => (
              <div
                key={h.text}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <h.icon className="w-4 h-4 text-primary shrink-0" />
                {h.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Feature list */}
        <div className="space-y-0">
          {features.map((feature, index) => (
            <motion.div
              key={feature.num}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
            >
              <div className="group grid grid-cols-1 md:grid-cols-[80px_1fr_1fr] gap-4 md:gap-8 py-8 border-t border-border hover:bg-accent/30 px-4 -mx-4 rounded-xl transition-colors duration-200">
                {/* Number */}
                <div className="flex items-start">
                  <span className="font-mono text-xs text-muted-foreground/60 pt-1">
                    {feature.num}
                  </span>
                </div>

                {/* Title + icon */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${feature.colorBg} flex items-center justify-center shrink-0 mt-0.5`}
                  >
                    <feature.icon className={`w-4.5 h-4.5 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-foreground mb-1">{feature.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {feature.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed md:pt-1">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Final border */}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
}
