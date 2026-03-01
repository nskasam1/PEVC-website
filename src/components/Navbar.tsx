import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const baseLinks = [
  { label: "Home", path: "/" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Team", path: "/team" },
  { label: "Projects", path: "/projects" },
];

const mockAlerts = [
  "New applicant: Jordan Lee",
  "Round 1 interview scheduled",
  "Client requested update on Acme Corp",
  "Task deadline approaching: Market Analysis",
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [...baseLinks];
  if (isAuthenticated && user) {
    if (["Admin", "PM", "Member"].includes(user.role)) {
      navLinks.push({ label: "My Projects", path: "/my-projects" });
    }
    if (["PM", "Member", "Client"].includes(user.role)) {
      navLinks.push({ label: "Portal", path: "/portal" });
    }
    if (user.role === "Admin") {
      navLinks.push({ label: "Recruiting", path: "/admin/recruiting" });
      navLinks.push({ label: "CMS", path: "/admin/content" });
    }
  }

  const isHome = location.pathname === "/";
  const navBg = scrolled || !isHome
    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
    : "bg-transparent";
  const textColor = scrolled || !isHome ? "text-foreground" : "text-white";
  const mutedColor = scrolled || !isHome ? "text-muted-foreground" : "text-white/70";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/TransparentPEVC.png"
            alt="PEVC Logo"
            className={`h-9 transition-all duration-300 ${scrolled || !isHome ? "brightness-0" : ""}`}
          />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.path ? "text-primary" : mutedColor
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Bell */}
          <div className="relative">
            <button onClick={() => setBellOpen(!bellOpen)} className={`${mutedColor} hover:text-primary transition-colors relative`}>
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            {bellOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground">Notifications</p>
                </div>
                {mockAlerts.map((a, i) => (
                  <div key={i} className="px-4 py-3 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <p className="text-xs text-foreground">{a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/pitch"
            className="bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold rounded-md transition-transform hover:scale-[1.02]"
          >
            Pitch Us
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className={`${mutedColor} hover:text-primary transition-colors`}>
                <User size={18} />
              </Link>
              <button onClick={() => { logout(); navigate("/"); }} className={`${mutedColor} hover:text-primary transition-colors`}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className={`${mutedColor} hover:text-primary transition-colors`}>
              <LogIn size={18} />
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden ${textColor}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-border"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/pitch"
                onClick={() => setMobileOpen(false)}
                className="bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold rounded-md text-center"
              >
                Pitch Us
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground">Profile</Link>
                  <Link to="/portal" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground">Portal</Link>
                  <button onClick={() => { logout(); setMobileOpen(false); navigate("/"); }} className="text-sm text-muted-foreground text-left">
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground">Sign In</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
