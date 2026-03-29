import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageWrapper from "@/components/PageWrapper";
import { Loader2 } from "lucide-react";

type Mode = "signin" | "signup";

const Login = () => {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { login, signUp, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigate as soon as session is confirmed — avoids race with async profile load
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signin") {
        await login(email, password);
        // navigation handled by the useEffect above once session is set
      } else {
        await signUp(email, password, name);
        setSignupSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (signupSuccess) {
    return (
      <PageWrapper>
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary text-xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
            <p className="text-muted-foreground text-sm mb-6">
              We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>.
              Click it to activate your account.
            </p>
            <button
              onClick={() => { setMode("signin"); setSignupSuccess(false); }}
              className="text-primary text-sm hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            {mode === "signin" ? "Access your PEVC dashboard" : "Apply to or join PEVC"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                  placeholder="Jane Doe"
                />
              </div>
            )}

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
                minLength={6}
                className="w-full bg-transparent scarlet-input px-0 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 rounded-md font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {mode === "signin" ? (
              <>
                Don't have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-primary hover:underline">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-primary hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Login;
