import { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";

interface Executive {
  name: string;
  role: string;
  img: string;
}

interface Analyst {
  name: string;
  role: string;
}

interface TeamSectionProps {
  executives: Executive[];
  analysts: Analyst[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const TeamSection = ({ executives, analysts }: TeamSectionProps) => {
  const [hoveredExec, setHoveredExec] = useState<number | null>(null);
  const [hoveredAnalyst, setHoveredAnalyst] = useState<number | null>(null);

  return (
    <div className="relative">
      {/* Animated grid background */}
      <div className="absolute inset-0 animated-grid opacity-50" />

      <div className="relative z-10">
        {/* Executive Board */}
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold mb-8">
          Executive Board
        </h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20"
        >
          {executives.map((member, idx) => (
            <motion.div
              key={member.name}
              variants={fadeUp}
              onMouseEnter={() => setHoveredExec(idx)}
              onMouseLeave={() => setHoveredExec(null)}
              className="group relative"
            >
              <div
                className={`
                  bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 text-center
                  transition-all duration-500
                  ${hoveredExec === idx ? "border-primary/30 shadow-[0_0_40px_hsl(348_90%_42%/0.06)]" : ""}
                `}
              >
                {/* Hover wave ripple */}
                <div
                  className={`absolute inset-0 rounded-lg bg-primary/[0.03] transition-opacity duration-500 ${
                    hoveredExec === idx ? "opacity-100" : "opacity-0"
                  }`}
                />

                <div className="relative z-10">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary overflow-hidden transition-all duration-500 group-hover:ring-2 group-hover:ring-primary/20 group-hover:ring-offset-2 group-hover:ring-offset-card">
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-muted-foreground">
                      {member.name.split(" ").map(n => n[0]).join("")}
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground tracking-tight">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mt-0.5">{member.role}</p>
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Linkedin size={14} className="mx-auto text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Analysts & Associates */}
        <h2 className="text-[11px] uppercase tracking-[0.25em] text-primary font-semibold mb-8">
          Analysts & Associates
        </h2>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          {analysts.map((member, idx) => (
            <motion.div
              key={member.name}
              variants={fadeUp}
              onMouseEnter={() => setHoveredAnalyst(idx)}
              onMouseLeave={() => setHoveredAnalyst(null)}
              className="group"
            >
              <div
                className={`
                  bg-card/50 backdrop-blur-sm border border-border rounded-lg p-4
                  transition-all duration-400
                  ${hoveredAnalyst === idx ? "border-primary/30" : ""}
                `}
              >
                <div className="w-10 h-10 mb-3 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="font-semibold text-sm text-foreground tracking-tight">{member.name}</h3>
                <p className="text-primary text-xs font-medium mt-0.5">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamSection;
