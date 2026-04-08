import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@/lib/database.types";

export type UserRole = "Guest" | "Applicant" | "Member" | "Admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  major?: string;
  gradYear?: string;
  linkedinUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  /** True once the initial session check is complete */
  loading: boolean;
  /** True when a session exists (use for auth guards instead of !!user) */
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<void>;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function mapDbRole(role: Profile["role"]): UserRole {
  if (role === "admin") return "Admin";
  if (role === "member") return "Member";
  return "Applicant";
}

function profileToAuthUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name ?? profile.email.split("@")[0],
    role: mapDbRole(profile.role),
    avatar: profile.avatar_url ?? undefined,
    major: profile.major ?? undefined,
    gradYear: profile.grad_year ?? undefined,
    linkedinUrl: profile.linkedin_url ?? undefined,
  };
}

/** Fetch profile; if the table doesn't exist or row is missing, upsert a default row */
async function fetchOrCreateProfile(userId: string, email: string, name: string): Promise<AuthUser> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (data) return profileToAuthUser(data);

  if (error) console.warn("fetchProfile:", error.message);

  // Profile missing (schema not run yet, or trigger didn't fire) — upsert a fallback
  const { data: upserted } = await supabase
    .from("profiles")
    .upsert({ id: userId, email, name, role: "applicant" as const })
    .select()
    .maybeSingle();

  if (upserted) return profileToAuthUser(upserted);

  // Last resort: return a minimal user so the app doesn't lock up
  return { id: userId, email, name, role: "Applicant" };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      // If session is stale/invalid, clear it so users aren't stuck
      if (error || !session) {
        if (error) await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setSession(session);
      if (session?.user) {
        const authUser = await fetchOrCreateProfile(
          session.user.id,
          session.user.email ?? "",
          session.user.user_metadata?.name ?? session.user.email?.split("@")[0] ?? ""
        );
        setUser(authUser);
      }
      setLoading(false);
    });

    // Listen for sign-in / sign-out / token refresh
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          const authUser = await fetchOrCreateProfile(
            session.user.id,
            session.user.email ?? "",
            session.user.user_metadata?.name ?? session.user.email?.split("@")[0] ?? ""
          );
          setUser(authUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    // onAuthStateChange handles setting user/session
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: "applicant" } },
    });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {
      // ignore lock errors — clear state regardless
    }
    // Clear all supabase auth keys from localStorage to force session removal
    Object.keys(localStorage)
      .filter((k) => k.startsWith("sb-") && k.includes("auth"))
      .forEach((k) => localStorage.removeItem(k));
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.major !== undefined) dbUpdates.major = updates.major;
    if (updates.gradYear !== undefined) dbUpdates.grad_year = updates.gradYear;
    if (updates.linkedinUrl !== undefined) dbUpdates.linkedin_url = updates.linkedinUrl;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;

    const { error } = await supabase.from("profiles").update(dbUpdates).eq("id", user.id);
    if (error) throw new Error(error.message);
    setUser({ ...user, ...updates });
  };

  const setRole = (_role: UserRole) => {};

  return (
    <AuthContext.Provider value={{
      user,
      session,
      // isAuthenticated is true as soon as a session exists, even before profile loads
      isAuthenticated: !!session,
      loading,
      login,
      signUp,
      logout,
      setRole,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
