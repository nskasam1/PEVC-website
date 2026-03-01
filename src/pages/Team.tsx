import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import TeamSection from "../components/ui/team-section";

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

const Team = () => {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-16 bg-background">
        <section className="container mx-auto px-6 py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
          >
            Our Team
          </motion.h1>
          <p className="text-muted-foreground mb-16 max-w-xl">
            Driven students with a passion for venture capital and entrepreneurship.
          </p>

          <TeamSection executives={executives} analysts={analysts} />
        </section>
      </div>
    </PageWrapper>
  );
};

export default Team;
