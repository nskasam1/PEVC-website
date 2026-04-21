import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import TeamSection from "../components/ui/team-section";

// Ordered by hierarchy: President → CIO(s) → IVP → EVP
const executives = [
  { name: "Alex Rivera", role: "President", img: "" },
  { name: "Sarah Chen", role: "Chief Investment Officer", img: "" },
  { name: "Marcus Johnson", role: "Internal Vice President", img: "" },
  { name: "Emily Park", role: "External Vice President", img: "" },
];

// Alphabetical by last name
const pms = [
  { name: "Jordan Lee", role: "Project Manager", project: "NeuralFlow Due Diligence" },
  { name: "Priya Sharma", role: "Project Manager", project: "PayGrid Market Analysis" },
  { name: "David Kim", role: "Project Manager", project: "HealthSync Evaluation" },
];

// All "Analyst", alphabetical by last name
const analysts = [
  { name: "Sophia Brown", role: "Analyst", project: "NeuralFlow Due Diligence" },
  { name: "Liam Davis", role: "Analyst", project: "PayGrid Market Analysis" },
  { name: "Olivia Martinez", role: "Analyst", project: "HealthSync Evaluation" },
  { name: "Noah Williams", role: "Analyst", project: "NeuralFlow Due Diligence" },
  { name: "Emma Wilson", role: "Analyst", project: "PayGrid Market Analysis" },
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

          <TeamSection executives={executives} pms={pms} analysts={analysts} />
        </section>
      </div>
    </PageWrapper>
  );
};

export default Team;
