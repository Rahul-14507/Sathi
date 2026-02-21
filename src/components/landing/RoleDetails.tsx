import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function RoleDetails() {
  const crFeatures = [
    "Broadcast timetable changes — students see it in seconds",
    "Set class-wide deadlines with automatic email reminders",
    "Manage resource bookings and hall requests",
    "Track which students have seen your updates",
  ];

  const mgmtFeatures = [
    "Oversee all departments from a single dashboard",
    "Approve student-led events and manage budgets",
    "Monitor engagement and academic progress trends",
    "Direct, structured communication channel with CRs",
  ];

  return (
    <section className="py-24 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-5">

        {/* CR Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16 mb-24">
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-border shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1589872880544-76e896b0592c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxTdHVkZW50cyUyMHN0dWR5aW5nJTIwY29sbGFib3JhdGl2ZSUyMG1vZGVybnxlbnwxfHx8fDE3NzE2ODQxMzd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Students collaborating"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-blue-600 text-white uppercase tracking-widest">
                  CR / IC Portal
                </span>
              </div>
            </motion.div>
          </div>

          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
                For class representatives
              </p>
              <h2 className="text-2xl md:text-3xl text-foreground mb-4 tracking-tight">
                Your class announcements,{" "}
                <span className="text-blue-500 dark:text-blue-400">finally heard.</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                No more pinning messages in 4 different groups. Post once —
                every student in your class sees it, on every device, with a deadline attached.
              </p>
              <ul className="space-y-3">
                {crFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-blue-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Management Section */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-16">
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-border shadow-lg"
            >
              <img
                src="https://images.unsplash.com/photo-1680444873773-7c106c23ac52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxNb2Rlcm4lMjB1bml2ZXJzaXR5JTIwY2FtcHVzJTIwYXJjaGl0ZWN0dXJlfGVufDF8fHx8MTc3MTY4NDEzN3ww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="University Campus"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-violet-600 text-white uppercase tracking-widest">
                  Management Portal
                </span>
              </div>
            </motion.div>
          </div>

          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
                For administrators
              </p>
              <h2 className="text-2xl md:text-3xl text-foreground mb-4 tracking-tight">
                Oversight without{" "}
                <span className="text-violet-500 dark:text-violet-400">the overhead.</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Real-time visibility into student engagement, event approvals,
                and academic trends — without chasing emails or sitting in another meeting.
              </p>
              <ul className="space-y-3">
                {mgmtFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-500/15 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-violet-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}
