import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

interface Company {
  name: string;
  category: string;
  description: string;
}

interface PortfolioGalleryProps {
  companies: Company[];
  categories: string[];
}

const PortfolioGallery = ({ companies, categories }: PortfolioGalleryProps) => {
  const [filter, setFilter] = useState("All");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const filtered = filter === "All" ? companies : companies.filter((c) => c.category === filter);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-300 ${
              filter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3D Overlapping Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((company, idx) => (
            <motion.div
              key={company.name}
              layout
              initial={{ opacity: 0, y: 20, rotateX: 5 }}
              animate={{
                opacity: 1,
                y: 0,
                rotateX: 0,
                z: hoveredIdx === idx ? 30 : 0,
                scale: hoveredIdx === idx ? 1.03 : 1,
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="relative group"
              style={{ perspective: "800px" }}
            >
              <div className="bg-card border border-border rounded-lg p-6 h-full transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-[0_0_40px_hsl(348_90%_42%/0.06)]">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[10px] text-primary font-semibold uppercase tracking-[0.2em]">
                    {company.category}
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all duration-300 -translate-y-1 group-hover:translate-y-0"
                  />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 tracking-tight">{company.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{company.description}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* CTA Card */}
        <motion.div layout>
          <Link
            to="/pitch"
            className="flex flex-col items-center justify-center h-full min-h-[160px] border border-dashed border-border rounded-lg p-6 text-center group hover:border-primary/40 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <Plus className="text-muted-foreground group-hover:text-primary transition-colors" size={20} />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Join the Portfolio</h3>
            <p className="text-xs text-muted-foreground mt-1">Pitch us your startup</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioGallery;
