import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { Linkedin } from "lucide-react";

const executives = [
  { name: "Alex Rivera", role: "Managing Partner", img: "" },
  { name: "Sarah Chen", role: "Chief Investment Officer", img: "" },
  { name: "Marcus Johnson", role: "Head of Operations", img: "" },
  { name: "Emily Park", role: "Director of Strategy", img: "" },
];

const analysts = [
  { name: "Jordan Lee", role: "Senior Analyst" },
  { name: "Priya Sharma", role: "Senior Analyst" },
  { name: "David Kim", role: "Analyst" },
  { name: "Olivia Martinez", role: "Analyst" },
  { name: "Noah Williams", role: "Analyst" },
  { name: "Sophia Brown", role: "Associate" },
  { name: "Liam Davis", role: "Associate" },
  { name: "Emma Wilson", role: "Associate" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const Team = () => {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-16 bg-background">
        <section className="container mx-auto px-6 py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Our Team
          </motion.h1>
          <p className="text-muted-foreground mb-16 max-w-xl">
            Driven students with a passion for venture capital and entrepreneurship.
          </p>

          {/* Executive Board */}
          <h2 className="text-sm uppercase tracking-widest text-primary font-semibold mb-8">
            Executive Board
          </h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          >
            {executives.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="group border border-border rounded-lg p-6 glow-border text-center"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-xl bg-secondary overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                </div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-primary text-sm font-medium">{member.role}</p>
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Linkedin size={16} className="mx-auto text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Analysts & Associates */}
          <h2 className="text-sm uppercase tracking-widest text-primary font-semibold mb-8">
            Analysts & Associates
          </h2>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {analysts.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                className="group border border-border rounded-lg p-4 glow-border"
              >
                <div className="w-12 h-12 mb-3 rounded-lg bg-secondary flex items-center justify-center text-sm font-bold text-muted-foreground grayscale group-hover:grayscale-0 transition-all">
                  {member.name.split(" ").map(n => n[0]).join("")}
                </div>
                <h3 className="font-semibold text-sm text-foreground">{member.name}</h3>
                <p className="text-primary text-xs font-medium">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default Team;
