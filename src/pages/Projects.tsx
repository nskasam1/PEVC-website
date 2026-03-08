import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { Calendar, FlaskConical, Megaphone, type LucideIcon } from "lucide-react";
import { useTilt } from "../hooks/use-tilt";

const projects = [
  {
    title: "Weekly Pitch Meetings",
    description: "Every week, we host startup founders who present their companies to our members. These sessions sharpen our due diligence skills and expose members to diverse business models across industries.",
    icon: Calendar,
    reverse: false,
  },
  {
    title: "Venture Lab",
    description: "A semester-long deep dive where teams partner with leading VC firms on real deal sourcing, market research, and investment memos. Members gain hands-on experience in the full venture capital process.",
    icon: FlaskConical,
    reverse: true,
  },
  {
    title: "Summit Events",
    description: "We host annual summits bringing together founders, investors, and industry leaders for panels, fireside chats, and networking. These events connect our university ecosystem with the broader startup world.",
    icon: Megaphone,
    reverse: false,
  },
];

const partnerFirms = [
  "Bain Capital", "General Atlantic", "Norwest Venture Partners",
  "Pivot North Capital", "Teamworthy Ventures", "Volition Capital",
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Per-component so useTilt hook isn't called conditionally
function ProjectVisual({ icon: Icon }: { icon: LucideIcon }) {
  const { motionStyle, onMouseMove, onMouseLeave } = useTilt(6);
  return (
    <div className="flex-1 w-full" style={{ perspective: "1000px" }}>
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={motionStyle}
        className="h-full"
      >
        <div className="aspect-video bg-card border border-border/50 flex items-center justify-center relative overflow-hidden group">
          {/* Animated corner bracket marks */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-primary/30 transition-all duration-500 group-hover:w-12 group-hover:h-12 group-hover:border-primary/60" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-primary/30 transition-all duration-500 group-hover:w-12 group-hover:h-12 group-hover:border-primary/60" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-primary/30 transition-all duration-500 group-hover:w-12 group-hover:h-12 group-hover:border-primary/60" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-primary/30 transition-all duration-500 group-hover:w-12 group-hover:h-12 group-hover:border-primary/60" />

          {/* Subtle grid inside the visual block */}
          <div className="absolute inset-0 animated-grid opacity-30" />

          {/* Icon — faint, large, centered */}
          <Icon
            className="text-primary/20 group-hover:text-primary/50 transition-all duration-500 group-hover:scale-110 relative z-10"
            size={60}
            strokeWidth={0.75}
          />

          {/* Scanline overlay for texture */}
          <div className="absolute inset-0 scanlines pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
}

const Projects = () => {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-16 bg-background">
        <section className="container mx-auto px-6 py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Projects & Initiatives
          </motion.h1>
          <p className="text-muted-foreground mb-20 max-w-xl font-dm">
            Hands-on experiences that bridge the gap between classroom learning and venture capital.
          </p>

          {/* Z-Pattern Sections */}
          <div className="space-y-24">
            {projects.map((project, i) => (
              <motion.div
                key={project.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row gap-12 items-center ${
                  project.reverse ? "md:flex-row-reverse" : ""
                }`}
              >
                <ProjectVisual icon={project.icon} />

                {/* Text */}
                <div className="flex-1">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-primary font-semibold mb-4">
                    Initiative {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 leading-tight">
                    {project.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm font-dm">{project.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Partner Firms — editorial numbered table */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32"
          >
            <div className="text-[10px] uppercase tracking-[0.4em] text-primary font-semibold mb-10 text-center">
              Partner Firms
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-border/30 border border-border/30 max-w-2xl mx-auto overflow-hidden">
              {partnerFirms.map((firm, i) => (
                <div
                  key={firm}
                  className="editorial-card bg-card p-5 group hover:bg-card/70 transition-colors duration-300"
                >
                  <div className="text-[9px] font-semibold tracking-[0.3em] text-muted-foreground/30 uppercase mb-1.5">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 tracking-tight">
                    {firm}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default Projects;
