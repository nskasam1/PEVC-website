import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "Guest" | "Applicant" | "Member" | "PM" | "Admin" | "Client";

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
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  "admin@pevc.com": { password: "admin", user: { id: "1", email: "admin@pevc.com", name: "Admin User", role: "Admin" } },
  "pm@pevc.com": { password: "pm", user: { id: "2", email: "pm@pevc.com", name: "PM User", role: "PM" } },
  "member@pevc.com": { password: "member", user: { id: "3", email: "member@pevc.com", name: "Member User", role: "Member" } },
  "client@pevc.com": { password: "client", user: { id: "4", email: "client@pevc.com", name: "Client User", role: "Client" } },
  "applicant@pevc.com": { password: "applicant", user: { id: "5", email: "applicant@pevc.com", name: "Applicant User", role: "Applicant" } },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, _password: string) => {
    const found = MOCK_USERS[email];
    if (found) {
      setUser({ ...found.user });
    } else {
      setUser({ id: Date.now().toString(), email, name: email.split("@")[0], role: "Applicant" });
    }
  };

  const logout = () => setUser(null);

  const setRole = (role: UserRole) => {
    if (user) setUser({ ...user, role });
  };

  const updateProfile = (updates: Partial<AuthUser>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, setRole, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
