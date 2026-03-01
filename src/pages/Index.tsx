import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import CountUp from "../components/CountUp";
import LogoTicker from "../components/LogoTicker";
import { ArrowRight, TrendingUp, Users, Handshake, GraduationCap, Target } from "lucide-react";

const stats = [
  { label: "Established", value: 2021, suffix: "" },
  { label: "Members", value: 80, suffix: "+" },
  { label: "Portfolio Companies", value: 15, suffix: "+" },
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

const Index = () => {
  return (
    <PageWrapper>
      <div className="min-h-screen">
        {/* Hero with background image */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/cbus.jpg')" }}
          />
          {/* Gradient overlay fading to #121212 background */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[hsl(0_0%_7%)]" />
          <div className="absolute inset-0 bg-primary/5" />

          <div className="relative z-10 container mx-auto px-6 text-center">
            <motion.img
              src="/images/TransparentPEVC.png"
              alt="PEVC Logo"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="h-20 md:h-28 mx-auto mb-8"
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
                to="/pitch"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold text-sm transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
              >
                Apply for Funding
              </Link>
              <Link
                to="/portfolio"
                className="border border-white/20 text-white px-8 py-3 rounded-md font-semibold text-sm transition-all hover:border-white/40 hover:bg-white/5 flex items-center justify-center gap-2"
              >
                View Portfolio <ArrowRight size={16} />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20"
            >
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    <CountUp end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs md:text-sm text-white/50 mt-1 uppercase tracking-[0.2em]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Logo Ticker */}
        <LogoTicker />

        {/* Three Pillars */}
        <section className="container mx-auto px-6 py-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {pillars.map((pillar) => (
              <motion.div
                key={pillar.title}
                variants={fadeUp}
                className="group bg-card border border-border rounded-lg p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_40px_hsl(348_90%_42%/0.05)]"
              >
                <pillar.icon className="text-primary mb-4" size={24} strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-foreground mb-3 tracking-tight">{pillar.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {pillar.description}
                </p>
                <Link
                  to={pillar.link}
                  className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  {pillar.cta} <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Why Founders */}
        <section className="border-y border-border">
          <div className="container mx-auto px-6 py-24">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-extrabold text-center mb-16 text-foreground tracking-tight"
            >
              Why Founders <span className="text-primary">Partner With Us</span>
            </motion.h2>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {whyFounders.map((item) => (
                <motion.div key={item.title} variants={fadeUp} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-card border border-border flex items-center justify-center group-hover:border-primary/30 transition-colors">
                    <item.icon className="text-primary" size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1 tracking-tight">{item.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/images/TransparentPEVC.png" alt="PEVC" className="h-6 opacity-60" />
              <span className="text-sm text-muted-foreground">© 2025 PEVC. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              {["Home", "Portfolio", "Team", "Projects", "Pitch Us"].map((l) => (
                <Link
                  key={l}
                  to={l === "Home" ? "/" : l === "Pitch Us" ? "/pitch" : `/${l.toLowerCase()}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
