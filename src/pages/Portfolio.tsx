import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import PortfolioGallery from "../components/ui/portfolio-gallery";

const categories = ["All", "AI", "SaaS", "Fintech", "Health", "Consumer"];

const companies = [
  { name: "NeuralFlow", category: "AI", description: "AI-powered workflow automation that reduces manual overhead across enterprise operations.", url: "" },
  { name: "PayGrid", category: "Fintech", description: "Next-gen payment infrastructure built for high-volume B2B transactions.", url: "" },
  { name: "CloudMesh", category: "SaaS", description: "Multi-cloud orchestration platform enabling seamless workload portability.", url: "" },
  { name: "HealthSync", category: "Health", description: "Patient data interoperability layer connecting disparate EHR systems.", url: "" },
  { name: "DataLens", category: "AI", description: "Real-time analytics engine for streaming data pipelines.", url: "" },
  { name: "FinStack", category: "Fintech", description: "Embedded finance toolkit enabling any SaaS product to offer financial services.", url: "" },
  { name: "ShipFast", category: "SaaS", description: "Developer deployment platform with zero-config CI/CD and instant rollbacks.", url: "" },
  { name: "Vitalis", category: "Health", description: "Digital therapeutics platform delivering clinically validated behavioral interventions.", url: "" },
  { name: "Cortex AI", category: "AI", description: "Enterprise knowledge assistant that surfaces institutional context across documents.", url: "" },
  { name: "BuyLocal", category: "Consumer", description: "Hyperlocal marketplace connecting consumers with neighborhood businesses.", url: "" },
  { name: "LedgerX", category: "Fintech", description: "Crypto-native accounting platform for institutional treasury management.", url: "" },
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
