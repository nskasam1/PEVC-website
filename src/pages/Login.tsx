import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import PageWrapper from "@/components/PageWrapper";
import { Linkedin } from "lucide-react";

const ROLE_OPTIONS: UserRole[] = ["Guest", "Applicant", "Member", "PM", "Admin", "Client"];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Applicant");
  const { login, setRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    setTimeout(() => {
      setRole(selectedRole);
      navigate("/profile");
    }, 100);
  };

  return (
    <PageWrapper>
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Sign In</h1>
          <p className="text-muted-foreground text-center mb-8">Access your PEVC dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Role (Demo)</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-card border border-border rounded-md px-3 py-2 text-foreground text-sm focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6">
            <button className="w-full flex items-center justify-center gap-2 border border-border py-3 rounded-md text-sm text-foreground hover:bg-secondary transition-colors">
              <Linkedin size={18} />
              Continue with LinkedIn
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Demo credentials: admin@pevc.com / admin, pm@pevc.com / pm, etc.
          </p>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Login;
