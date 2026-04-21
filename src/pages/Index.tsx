import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import CountUp from "../components/CountUp";
import LogoTicker from "../components/LogoTicker";
import { useTilt } from "../hooks/use-tilt";
import { ArrowRight, TrendingUp, Users, Handshake, GraduationCap, Target, type LucideIcon } from "lucide-react";

const stats = [
  { label: "Established", value: 2019, suffix: "" },
  { label: "Members", value: 80, suffix: "+" },
  { label: "Projects", value: 15, suffix: "+" },
];

const pillars = [
  {
    title: "The Fund",
    description: "We source, screen, and invest in early-stage startups, co-investing alongside established VC firms. Our investment decisions are made independently by our student board.",
    cta: "View Portfolio",
    link: "/portfolio",
    icon: TrendingUp,
  },
  {
    title: "The Club",
    description: "A community of student founders, future investors, and startup enthusiasts. We come together weekly to hear pitches, host guest speakers, and review investment proposals.",
    cta: "Join the Club",
    link: "/pitch",
    icon: Users,
  },
  {
    title: "The Network",
    description: "We partner with leading VC firms for semester-long projects, providing hands-on exposure to venture capital and building strategic relationships.",
    cta: "Explore Projects",
    link: "/projects",
    icon: Handshake,
  },
];

const whyFounders = [
  {
    icon: GraduationCap,
    title: "Brand Recognition",
    description: "Our university's reputation lends credibility and trust to your startup, opening doors and building confidence among partners.",
  },
  {
    icon: Users,
    title: "Access Top Talent",
    description: "Partnering with us opens a channel to recruit ambitious talent from within our startup-enthusiastic ecosystem.",
  },
  {
    icon: Target,
    title: "Multipurpose Checks",
    description: "Our investments can serve as the financial springboard to launching your startup or help complete your current fundraising round.",
  },
  {
    icon: TrendingUp,
    title: "Fresh Perspectives",
    description: "We're a young and ambitious group with forward-thinking mindsets, able to recognize and champion disruptive vision when others can't.",
  },
];

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ─── Per-card component so useTilt hook isn't called in a loop ───────────────
interface PillarData {
  title: string;
  description: string;
  cta: string;
  link: string;
  icon: LucideIcon;
}

function PillarCard({ pillar, index }: { pillar: PillarData; index: number }) {
  const { motionStyle, onMouseMove, onMouseLeave } = useTilt(7);
  const Icon = pillar.icon;
  return (
    <motion.div variants={fadeUp} style={{ perspective: "1000px" }}>
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={motionStyle}
        className="h-full"
      >
        <div className="group editorial-card bg-card border border-border p-8 transition-all duration-500 hover:border-primary/25 hover:bg-[hsl(0_0%_16%)] flex flex-col h-full">
          <div className="flex justify-between items-start mb-10">
            <span className="text-[10px] font-semibold tracking-[0.4em] text-muted-foreground/40 uppercase">
              0{index + 1}
            </span>
            <Icon
              className="text-muted-foreground/30 group-hover:text-primary transition-colors duration-500"
              size={18}
              strokeWidth={1.5}
            />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight">{pillar.title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1 font-dm">
            {pillar.description}
          </p>
          <Link
            to={pillar.link}
            className="text-primary text-xs font-semibold flex items-center gap-2 group-hover:gap-3 transition-all duration-300 tracking-[0.15em] uppercase self-start"
          >
            {pillar.cta} <ArrowRight size={12} />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const Index = () => {
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, active: false });

  return (
    <PageWrapper>
      <div className="min-h-screen">
        {/* Hero */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/cbus.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[hsl(0_0%_10%)]" />
          <div className="absolute inset-0 bg-primary/5" />

          <div className="relative z-10 container mx-auto px-6 text-center">
            <motion.img
              src="/images/PEVCTransparent.png"
              alt="PEVC Logo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="h-32 md:h-44 mx-auto mb-10 animate-float"
            />
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.15] mb-6 text-white"
            >
              Supporting OSU's relationship with the private equity and venture capital community
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="/apply"
                className="bg-primary text-primary-foreground pl-[calc(2rem+0.15em)] pr-8 py-3 font-semibold text-xs tracking-[0.15em] uppercase transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
              >
                Apply
              </Link>
              <Link
                to="/team"
                className="border border-white/20 text-white pl-[calc(2rem+0.15em)] pr-8 py-3 font-semibold text-xs tracking-[0.15em] uppercase transition-all hover:border-white/40 hover:bg-white/5 flex items-center justify-center gap-2"
              >
                Meet the Club <ArrowRight size={14} />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="mt-20 max-w-lg mx-auto bg-white/5 backdrop-blur-sm border border-white/10 px-8 py-6"
            >
              <div className="grid grid-cols-3 gap-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                      <CountUp end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-xs md:text-sm text-white/50 mt-1 uppercase tracking-[0.2em] font-dm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Logo Ticker */}
        <LogoTicker />

        {/* Three Pillars — cursor spotlight effect on the whole section */}
        <section
          className="container mx-auto px-6 py-24 relative"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
          }}
          onMouseLeave={() => setSpotlight((s) => ({ ...s, active: false }))}
        >
          {/* Radial spotlight follows cursor */}
          {spotlight.active && (
            <div
              className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
              style={{
                background: `radial-gradient(500px circle at ${spotlight.x}px ${spotlight.y}px, hsl(348 90% 46% / 0.08) 0%, transparent 65%)`,
              }}
            />
          )}

          {/* Section eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative z-10 flex items-center gap-4 mb-10"
          >
            <span className="text-[10px] font-semibold tracking-[0.4em] text-primary uppercase font-dm">
              What We Do
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative z-10 grid md:grid-cols-3 gap-3"
          >
            {pillars.map((pillar, i) => (
              <PillarCard key={pillar.title} pillar={pillar} index={i} />
            ))}
          </motion.div>
        </section>

        {/* Why Founders */}
        <section className="border-y border-border/50">
          <div className="container mx-auto px-6 py-24">
            <div className="flex flex-col md:flex-row gap-16 max-w-5xl mx-auto">
              {/* Left label */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="md:w-56 flex-shrink-0"
              >
                <div className="text-[10px] tracking-[0.35em] text-primary font-semibold uppercase mb-3">Why Join</div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                  Why Students<br />
                  <span className="text-primary">Choose PEVC</span>
                </h2>
              </motion.div>

              {/* Right: editorial numbered list */}
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="flex-1 divide-y divide-border/30"
              >
                {whyFounders.map((item, i) => (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    className="flex gap-6 group py-6 first:pt-0 last:pb-0"
                  >
                    <div className="flex-shrink-0 text-[10px] font-semibold tracking-[0.35em] text-primary/60 uppercase pt-0.5 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <item.icon className="text-primary flex-shrink-0" size={14} strokeWidth={1.5} />
                        <h4 className="font-semibold text-foreground tracking-tight text-sm">{item.title}</h4>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed font-dm">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/PEVCTransparent.png" alt="PEVC" className="h-10 opacity-100" />
              <span className="text-sm text-muted-foreground font-dm">© 2025 PEVC. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              {["Home", "Portfolio", "Team", "Projects", "Pitch Us"].map((l) => (
                <Link
                  key={l}
                  to={l === "Home" ? "/" : l === "Pitch Us" ? "/pitch" : `/${l.toLowerCase()}`}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors tracking-[0.1em] uppercase font-dm"
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </PageWrapper>
  );
};

export default Index;
