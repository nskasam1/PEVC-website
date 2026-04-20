import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const baseLinks = [
  { label: "Home", path: "/" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Team", path: "/team" },
  { label: "Projects", path: "/projects" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
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
      navLinks.push({ label: "Calendar", path: "/calendar" });
    }
    if (user.role === "Applicant") {
      navLinks.push({ label: "Apply", path: "/apply" });
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
    ? "bg-background/80 backdrop-blur-md border-b border-border"
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${navBg}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-[0.2em] text-white uppercase font-syne">PEVC</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-medium transition-colors duration-200 hover:text-primary ${
                location.pathname === link.path ? "text-primary" : "text-white/70 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <Link
            to="/pitch"
            className="bg-primary text-primary-foreground px-5 py-2 text-sm font-semibold rounded-md transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20"
          >
            Pitch Us
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-white/70 hover:text-primary transition-colors">
                <User size={18} />
              </Link>
              <button onClick={async () => { await logout(); navigate("/"); }} className="text-white/70 hover:text-primary transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-white/70 hover:text-primary transition-colors">
              <LogIn size={18} />
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white"
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
            className="md:hidden bg-card border-b border-border"
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
                  <button onClick={async () => { await logout(); setMobileOpen(false); navigate("/"); }} className="text-sm text-muted-foreground text-left">
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
