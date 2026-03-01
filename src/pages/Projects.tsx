import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { Calendar, FlaskConical, Megaphone } from "lucide-react";

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
          <p className="text-muted-foreground mb-20 max-w-xl">
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
                {/* Visual */}
                <div className="flex-1 w-full">
                  <div className="aspect-video rounded-lg bg-secondary border border-border flex items-center justify-center">
                    <project.icon className="text-primary" size={64} strokeWidth={1} />
                  </div>
                </div>
                {/* Text */}
                <div className="flex-1">
                  <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-3">
                    Initiative {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {project.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Partner Firms */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-32"
          >
            <h2 className="text-sm uppercase tracking-widest text-primary font-semibold mb-8 text-center">
              Partner Firms
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {partnerFirms.map((firm) => (
                <div
                  key={firm}
                  className="border border-border rounded-lg p-4 text-center text-sm font-medium text-muted-foreground glow-border"
                >
                  {firm}
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
