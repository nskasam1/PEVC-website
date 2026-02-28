import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";

// ─── Types ───────────────────────────────────────────────────
export type DeliverableStatus = "not_started" | "in_progress" | "review" | "done";

export interface Deliverable {
  id: string;
  title: string;
  status: DeliverableStatus;
  assigneeId: string;
  assigneeName: string;
  deadline: string;
  projectId: string;
}

export interface ClientInfo {
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  pmId: string;
  pmName: string;
  clientInfo: ClientInfo;
  memberIds: string[];
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  projectId: string;
}

interface ProjectContextType {
  projects: Project[];
  deliverables: Deliverable[];
  notifications: Notification[];
  // Admin
  createProject: (p: Omit<Project, "id" | "createdAt">) => void;
  assignPmToProject: (projectId: string, pmId: string, pmName: string) => void;
  // PM
  addDeliverable: (d: Omit<Deliverable, "id">) => void;
  updateClientInfo: (projectId: string, info: ClientInfo) => void;
  addMemberToProject: (projectId: string, memberId: string) => void;
  // Member / PM
  updateDeliverableStatus: (deliverableId: string, status: DeliverableStatus) => void;
  deleteDeliverable: (deliverableId: string) => void;
  // Notifications
  markNotificationRead: (notifId: string) => void;
  // Helpers
  getMyProjects: () => Project[];
  getProjectDeliverables: (projectId: string) => Deliverable[];
}

const ProjectContext = createContext<ProjectContextType>({} as ProjectContextType);

// ─── Mock seed data ──────────────────────────────────────────
const SEED_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Acme Corp Due Diligence",
    description: "Full due diligence package for Series A investment in Acme Corp.",
    pmId: "2",
    pmName: "PM User",
    clientInfo: { name: "John Doe", company: "Acme Corp", email: "john@acme.com", phone: "555-0101", notes: "Prefers weekly updates on Fridays." },
    memberIds: ["3"],
    createdAt: "2026-01-15",
  },
  {
    id: "proj-2",
    name: "TechStart Evaluation",
    description: "Market sizing and competitive analysis for TechStart's seed round.",
    pmId: "2",
    pmName: "PM User",
    clientInfo: { name: "Jane Smith", company: "TechStart Inc.", email: "jane@techstart.io", phone: "555-0202", notes: "Interested in AI/ML market segment." },
    memberIds: ["3"],
    createdAt: "2026-02-01",
  },
  {
    id: "proj-3",
    name: "GreenVentures Pipeline",
    description: "Deal sourcing and pipeline management for GreenVentures LLC.",
    pmId: "6",
    pmName: "PM Beta",
    clientInfo: { name: "Carlos Green", company: "GreenVentures LLC", email: "carlos@gv.com", phone: "555-0303", notes: "" },
    memberIds: ["7"],
    createdAt: "2026-02-10",
  },
];

const SEED_DELIVERABLES: Deliverable[] = [
  { id: "del-1", title: "Competitive Analysis Report", status: "in_progress", assigneeId: "3", assigneeName: "Member User", deadline: "2026-03-15", projectId: "proj-1" },
  { id: "del-2", title: "Financial Model v1", status: "done", assigneeId: "3", assigneeName: "Member User", deadline: "2026-03-10", projectId: "proj-1" },
  { id: "del-3", title: "Market Sizing Deck", status: "not_started", assigneeId: "3", assigneeName: "Member User", deadline: "2026-04-01", projectId: "proj-2" },
  { id: "del-4", title: "Investor Memo Draft", status: "review", assigneeId: "3", assigneeName: "Member User", deadline: "2026-03-20", projectId: "proj-1" },
  { id: "del-5", title: "Pipeline Tracker Setup", status: "in_progress", assigneeId: "7", assigneeName: "Member Beta", deadline: "2026-03-25", projectId: "proj-3" },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", message: "Financial Model v1 marked as Done (Acme Corp)", timestamp: "2026-02-28T10:00:00", read: false, projectId: "proj-1" },
  { id: "n2", message: "Investor Memo moved to Review (Acme Corp)", timestamp: "2026-02-27T15:30:00", read: false, projectId: "proj-1" },
];

// ─── Available members for assignment ────────────────────────
export const ALL_MEMBERS = [
  { id: "3", name: "Member User" },
  { id: "7", name: "Member Beta" },
  { id: "8", name: "Analyst Chen" },
];

export const ALL_PMS = [
  { id: "2", name: "PM User" },
  { id: "6", name: "PM Beta" },
];

// ─── Provider ────────────────────────────────────────────────
export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS);
  const [deliverables, setDeliverables] = useState<Deliverable[]>(SEED_DELIVERABLES);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);

  const pushNotif = (message: string, projectId: string) => {
    setNotifications((prev) => [
      { id: Date.now().toString(), message, timestamp: new Date().toISOString(), read: false, projectId },
      ...prev,
    ]);
  };

  const createProject = (p: Omit<Project, "id" | "createdAt">) => {
    const newP: Project = { ...p, id: `proj-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
    setProjects((prev) => [...prev, newP]);
    pushNotif(`New project created: ${newP.name}`, newP.id);
  };

  const assignPmToProject = (projectId: string, pmId: string, pmName: string) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, pmId, pmName } : p));
    pushNotif(`${pmName} assigned as PM to project`, projectId);
  };

  const addDeliverable = (d: Omit<Deliverable, "id">) => {
    const nd: Deliverable = { ...d, id: `del-${Date.now()}` };
    setDeliverables((prev) => [...prev, nd]);
    pushNotif(`New deliverable: ${nd.title}`, nd.projectId);
  };

  const updateClientInfo = (projectId: string, info: ClientInfo) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, clientInfo: info } : p));
  };

  const addMemberToProject = (projectId: string, memberId: string) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, memberIds: [...new Set([...p.memberIds, memberId])] } : p));
  };

  const updateDeliverableStatus = (deliverableId: string, status: DeliverableStatus) => {
    setDeliverables((prev) => prev.map((d) => {
      if (d.id !== deliverableId) return d;
      pushNotif(`"${d.title}" status → ${status.replace("_", " ")}`, d.projectId);
      return { ...d, status };
    }));
  };

  const deleteDeliverable = (deliverableId: string) => {
    setDeliverables((prev) => prev.filter((d) => d.id !== deliverableId));
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => n.id === notifId ? { ...n, read: true } : n));
  };

  const getMyProjects = useCallback((): Project[] => {
    if (!user) return [];
    if (user.role === "Admin") return projects;
    if (user.role === "PM") return projects.filter((p) => p.pmId === user.id);
    if (user.role === "Member") return projects.filter((p) => p.memberIds.includes(user.id));
    return [];
  }, [user, projects]);

  const getProjectDeliverables = useCallback((projectId: string): Deliverable[] => {
    return deliverables.filter((d) => d.projectId === projectId);
  }, [deliverables]);

  return (
    <ProjectContext.Provider value={{
      projects, deliverables, notifications,
      createProject, assignPmToProject, addDeliverable, updateClientInfo, addMemberToProject,
      updateDeliverableStatus, deleteDeliverable, markNotificationRead,
      getMyProjects, getProjectDeliverables,
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);
