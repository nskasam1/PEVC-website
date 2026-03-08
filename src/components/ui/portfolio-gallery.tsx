import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTilt } from "@/hooks/use-tilt";

interface Company {
  name: string;
  category: string;
  description: string;
  img?: string;
}

interface PortfolioGalleryProps {
  companies: Company[];
  categories: string[];
}

// Category → subtle dark-tinted gradient stop
const categoryAccent: Record<string, string> = {
  AI:       "rgba(49,  46, 129, 0.30)",
  Fintech:  "rgba( 6,  78,  59, 0.30)",
  SaaS:     "rgba(30,  58, 138, 0.30)",
  Health:   "rgba(19,  78,  74, 0.30)",
  Consumer: "rgba(120, 53,  15, 0.30)",
};

function CollageCard({
  company,
  featured,
}: {
  company: Company;
  featured: boolean;
}) {
  const { motionStyle, onMouseMove, onMouseLeave } = useTilt(featured ? 4 : 8);
  const accent = categoryAccent[company.category] ?? "rgba(30,30,30,0.4)";
  const initials = company.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 4);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={featured ? "sm:col-span-2" : ""}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={motionStyle}
        className="h-full"
      >
        {/* Card shell */}
        <div
          className="editorial-card group relative overflow-hidden flex flex-col border border-border/40 hover:border-primary/25 transition-all duration-500"
          style={{
            minHeight: featured ? "340px" : "260px",
            background: `linear-gradient(145deg, ${accent} 0%, hsl(0 0% 8%) 55%)`,
          }}
        >
          {/* — IMAGE SLOT — drop a real <img> here when available */}
          {company.img ? (
            <img
              src={company.img}
              alt={company.name}
              className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500 select-none pointer-events-none"
            />
          ) : (
            /* Placeholder: giant faded initials */
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <span
                className="font-extrabold tracking-tighter uppercase select-none leading-none text-foreground/[0.035] font-syne"
                style={{ fontSize: featured ? "10rem" : "7rem" }}
              >
                {initials}
              </span>
            </div>
          )}

          {/* Subtle grid overlay */}
          <div className="absolute inset-0 animated-grid opacity-20 pointer-events-none" />

          {/* Top row: category tag + arrow */}
          <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-5 z-10">
            <span className="text-[9px] font-semibold uppercase tracking-[0.3em] border border-primary/30 text-primary px-2 py-0.5 backdrop-blur-sm bg-black/30">
              {company.category}
            </span>
            <ArrowUpRight
              size={14}
              className="text-white/0 group-hover:text-primary transition-all duration-400 -translate-y-1 group-hover:translate-y-0 group-hover:text-opacity-100"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom overlay — name + description reveal */}
          <div className="relative z-10 px-5 pb-5">
            <div className="border-t border-white/10 pt-4">
              <h3
                className={`font-bold text-foreground tracking-tight leading-none ${
                  featured ? "text-2xl md:text-3xl" : "text-lg"
                }`}
              >
                {company.name}
              </h3>
              <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover:max-h-16">
                <p className="text-xs text-muted-foreground leading-relaxed mt-2 font-dm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-75">
                  {company.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const PortfolioGallery = ({ companies, categories }: PortfolioGalleryProps) => {
  const [filter, setFilter] = useState("All");
  const filtered =
    filter === "All" ? companies : companies.filter((c) => c.category === filter);

  return (
    <div>
      {/* Filter row — rectangular, uppercase micro-text */}
      <div className="flex flex-wrap gap-2 mb-12">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 text-[10px] font-semibold tracking-[0.25em] uppercase border transition-all duration-300 ${
              filter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Collage grid — gap-px gives the panel-seam editorial look */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/20">
        <AnimatePresence mode="popLayout">
          {filtered.map((company, idx) => (
            <CollageCard
              key={company.name}
              company={company}
              featured={idx === 0 && filtered.length >= 3}
            />
          ))}
        </AnimatePresence>

        {/* CTA: join the portfolio */}
        <motion.div layout style={{ perspective: "1000px" }}>
          <Link
            to="/pitch"
            className="editorial-card group flex flex-col items-center justify-center h-full border border-dashed border-border/30 bg-card/20 text-center hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
            style={{ minHeight: "260px" }}
          >
            <div className="w-9 h-9 border border-border/50 flex items-center justify-center mb-3 group-hover:border-primary/50 group-hover:rotate-45 transition-all duration-500">
              <Plus
                className="text-muted-foreground group-hover:text-primary transition-colors group-hover:-rotate-45 duration-500"
                size={16}
              />
            </div>
            <h3 className="text-xs font-semibold text-foreground tracking-[0.15em] uppercase">
              Join the Portfolio
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 font-dm">
              Pitch us your startup
            </p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default PortfolioGallery;
