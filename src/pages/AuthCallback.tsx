import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * Landing page for Supabase email confirmation redirects.
 * Supabase appends #access_token=...&type=signup to the URL.
 * The client picks it up automatically; we just wait and redirect.
 */
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/profile", { replace: true });
      } else {
        // Poll briefly in case the hash hasn't been processed yet
        const unsub = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            unsub.data.subscription.unsubscribe();
            navigate("/profile", { replace: true });
          }
        });
        // Fallback: redirect to login after 5s if nothing happens
        const t = setTimeout(() => navigate("/login", { replace: true }), 5000);
        return () => clearTimeout(t);
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 size={32} className="animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Confirming your account…</p>
    </div>
  );
};

export default AuthCallback;
