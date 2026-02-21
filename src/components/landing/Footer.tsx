import { Github, Twitter, Linkedin } from "lucide-react";

const links = {
  Platform: ["Student Portal", "CR/IC Dashboard", "Management", "Roadmap"],
  Community: ["Discussions", "Hackathons", "Events", "Discord"],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-14">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand block */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 p-1 border border-white/10">
                <img
                  src="/Sathi.png"
                  alt="Sathi Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-bold text-foreground tracking-tight">
                Sathi
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                beta
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              A free, open-source platform for students and institutions. No
              premium tier. No tracking. Just organized.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-mono">
            © 2026 Sathi · MIT License · Made with too much coffee
          </p>
          <div className="flex gap-3">
            {[
              { icon: Github, label: "GitHub" },
              { icon: Twitter, label: "Twitter" },
              { icon: Linkedin, label: "LinkedIn" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-8 h-8 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
