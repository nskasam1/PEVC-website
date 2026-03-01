import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import PortfolioGallery from "../components/ui/portfolio-gallery";

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

const Portfolio = () => {
  return (
    <PageWrapper>
      <div className="min-h-screen pt-16 bg-background">
        <section className="container mx-auto px-6 py-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight"
          >
            Portfolio
          </motion.h1>
          <p className="text-muted-foreground mb-12 max-w-xl">
            Companies we've backed across sectors. Early-stage conviction, long-term partnership.
          </p>

          <PortfolioGallery companies={companies} categories={categories} />
        </section>
      </div>
    </PageWrapper>
  );
};

export default Portfolio;
