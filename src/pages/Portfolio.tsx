import { useState } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { Plus } from "lucide-react";

const categories = ["All", "AI", "SaaS", "Fintech", "Health", "Consumer"];

const companies = [
  { name: "NeuralFlow", category: "AI", description: "AI-powered workflow automation" },
  { name: "PayGrid", category: "Fintech", description: "Next-gen payment infrastructure" },
  { name: "CloudMesh", category: "SaaS", description: "Multi-cloud orchestration platform" },
  { name: "HealthSync", category: "Health", description: "Patient data interoperability" },
  { name: "DataLens", category: "AI", description: "Real-time analytics engine" },
  { name: "FinStack", category: "Fintech", description: "Embedded finance toolkit" },
  { name: "ShipFast", category: "SaaS", description: "Developer deployment platform" },
  { name: "Vitalis", category: "Health", description: "Digital therapeutics platform" },
  { name: "Cortex AI", category: "AI", description: "Enterprise knowledge assistant" },
  { name: "BuyLocal", category: "Consumer", description: "Hyperlocal marketplace" },
  { name: "LedgerX", category: "Fintech", description: "Crypto-native accounting" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Portfolio = () => {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? companies : companies.filter((c) => c.category === filter);

  return (
    <PageWrapper>
      <div className="min-h-screen pt-16">
        <section className="container mx-auto px-6 py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4"
          >
            Portfolio
          </motion.h1>
          <p className="text-muted-foreground mb-12 max-w-xl">
            Companies we've backed across sectors. Early-stage conviction, long-term partnership.
          </p>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filter === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {filtered.map((company) => (
              <motion.div
                key={company.name}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                layout
                className="border border-border rounded-lg p-6 glow-border"
              >
                <div className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                  {company.category}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{company.name}</h3>
                <p className="text-sm text-muted-foreground">{company.description}</p>
              </motion.div>
            ))}

            {/* CTA Card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center glow-border cursor-pointer hover:border-primary transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                <Plus className="text-primary" size={24} />
              </div>
              <h3 className="text-sm font-bold text-foreground">Join the Portfolio</h3>
              <p className="text-xs text-muted-foreground mt-1">Pitch us your startup</p>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </PageWrapper>
  );
};

export default Portfolio;
