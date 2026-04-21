import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import { useTilt } from "@/hooks/use-tilt";

interface Executive {
  name: string;
  role: string;
  img: string;
  linkedin?: string;
}

interface PM {
  name: string;
  role: string;
  project: string;
}

interface Analyst {
  name: string;
  role: string;
  project?: string;
}

interface TeamSectionProps {
  executives: Executive[];
  pms: PM[];
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

// Per-card component so useTilt can be called per exec
function ExecCard({ member }: { member: Executive }) {
  const { motionStyle, onMouseMove, onMouseLeave } = useTilt(5);
  const initials = member.name.split(" ").map((n) => n[0]).join("");

  return (
    <motion.div variants={fadeUp} style={{ perspective: "900px" }}>
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={motionStyle}
        className="h-full"
      >
        <div className="editorial-card group bg-card/50 backdrop-blur-sm border border-border/40 p-6 text-center transition-all duration-500 hover:border-primary/20 h-full">
          {/* Avatar */}
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary overflow-hidden transition-all duration-500 group-hover:ring-1 group-hover:ring-primary/30 group-hover:ring-offset-2 group-hover:ring-offset-card">
            {member.img ? (
              <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-muted-foreground font-syne">
                {initials}
              </div>
            )}
          </div>
          <h3 className="font-semibold text-foreground tracking-tight text-sm">{member.name}</h3>
          <p className="text-primary text-[10px] font-semibold mt-1 tracking-[0.15em] uppercase">{member.role}</p>
          <div className="mt-3">
            {member.linkedin ? (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block opacity-50 hover:opacity-100 transition-opacity duration-300"
              >
                <Linkedin size={12} className="mx-auto text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              </a>
            ) : (
              <Linkedin size={12} className="mx-auto text-muted-foreground opacity-50" />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MemberCard({ name, role, sub }: { name: string; role: string; sub?: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("");
  return (
    <motion.div variants={fadeUp} className="group">
      <div className="editorial-card bg-card/50 backdrop-blur-sm border border-border/40 p-5 transition-all duration-400 hover:border-primary/20">
        <div className="w-8 h-8 mb-3 bg-secondary flex items-center justify-center text-[11px] font-bold text-muted-foreground transition-all group-hover:bg-primary/10 group-hover:text-primary font-syne">
          {initials}
        </div>
        <h3 className="font-semibold text-sm text-foreground tracking-tight">{name}</h3>
        <p className="text-primary text-[10px] font-semibold mt-0.5 tracking-[0.1em] uppercase">{role}</p>
        {sub && (
          <p className="text-muted-foreground/60 text-[10px] mt-1 font-dm truncate">{sub}</p>
        )}
      </div>
    </motion.div>
  );
}

const TeamSection = ({ executives, pms, analysts }: TeamSectionProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 animated-grid opacity-50" />

      <div className="relative z-10">
        {/* Executive Board */}
        <div className="text-[10px] uppercase tracking-[0.35em] text-primary font-semibold mb-8">
          Executive Board
        </div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/20 mb-20"
        >
          {executives.map((member) => (
            <ExecCard key={member.name} member={member} />
          ))}
        </motion.div>

        {/* Project Managers */}
        {pms.length > 0 && (
          <>
            <div className="text-[10px] uppercase tracking-[0.35em] text-primary font-semibold mb-8">
              Project Managers
            </div>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border/20 mb-20"
            >
              {pms.map((member) => (
                <MemberCard key={member.name} name={member.name} role={member.role} sub={member.project} />
              ))}
            </motion.div>
          </>
        )}

        {/* Analysts */}
        <div className="text-[10px] uppercase tracking-[0.35em] text-primary font-semibold mb-8">
          Analysts
        </div>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-border/20"
        >
          {analysts.map((member) => (
            <MemberCard key={member.name} name={member.name} role={member.role} sub={member.project} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default TeamSection;
