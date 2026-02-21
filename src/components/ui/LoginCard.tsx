import { motion } from "framer-motion";
import { LucideIcon, ArrowRight } from "lucide-react";

interface LoginCardProps {
  title: string;
  role: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  btnClass: string;
  delay: number;
  onClick: () => void;
}

export function LoginCard({
  title,
  role,
  tagline,
  description,
  icon: Icon,
  accentColor,
  accentBg,
  accentText,
  accentBorder,
  btnClass,
  onClick,
}: LoginCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="relative group cursor-pointer h-full"
      onClick={onClick}
    >
      <div className="h-full flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-200 group-hover:border-border group-hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.5)]">
        {/* Top accent line */}
        <div
          className="h-0.5 w-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />

        <div className="flex flex-col flex-1 p-6">
          {/* Header row */}
          <div className="flex items-start justify-between mb-5">
            <div className={`w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${accentText}`} />
            </div>
            <span
              className={`font-mono text-[10px] tracking-widest uppercase px-2 py-1 rounded-md border ${accentBorder} ${accentBg} ${accentText}`}
            >
              {role}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-foreground mb-1">{title}</h3>

          {/* Tagline */}
          <p className={`font-mono text-[11px] ${accentText} mb-3`}>{tagline}</p>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
            {description}
          </p>

          {/* CTA Button */}
          <button
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${btnClass}`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <span>Enter Portal</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
