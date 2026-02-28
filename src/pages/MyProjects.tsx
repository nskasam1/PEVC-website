import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects, ALL_PMS, ALL_MEMBERS, type Project, type ClientInfo } from "@/contexts/ProjectContext";
import { Navigate, Link } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import {
  FolderOpen, Plus, X, Users, BarChart3, Bell, CheckCircle2,
  Clock, AlertCircle, FileText,
} from "lucide-react";

// ─── Status helpers ──────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  not_started: { label: "Not Started", color: "text-muted-foreground", icon: AlertCircle },
  in_progress: { label: "In Progress", color: "text-yellow-400", icon: Clock },
  review: { label: "In Review", color: "text-blue-400", icon: FileText },
  done: { label: "Done", color: "text-green-400", icon: CheckCircle2 },
};

// ─── Create Project Modal (Admin) ────────────────────────────
const CreateProjectModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { createProject } = useProjects();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pmId, setPmId] = useState(ALL_PMS[0].id);
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  if (!open) return null;

  const submit = () => {
    if (!name.trim()) return;
    const pm = ALL_PMS.find((p) => p.id === pmId)!;
    createProject({
      name,
      description,
      pmId,
      pmName: pm.name,
      clientInfo: { name: clientName, company: clientCompany, email: clientEmail, phone: "", notes: "" },
      memberIds: [],
    });
    toast({ title: "Project Created", description: `"${name}" assigned to ${pm.name}` });
    setName(""); setDescription(""); setClientName(""); setClientCompany(""); setClientEmail("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">Create New Project</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Project Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full bg-card border border-border rounded-md p-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Assign PM</label>
            <select value={pmId} onChange={(e) => setPmId(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
              {ALL_PMS.map((pm) => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
            </select>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Client Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Client Name" className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
              <input value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} placeholder="Company" className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
              <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Email" className="sm:col-span-2 bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
            </div>
          </div>
          <button onClick={submit} className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Project Card ────────────────────────────────────────────
const ProjectCard = ({ project }: { project: Project }) => {
  const { getProjectDeliverables } = useProjects();
  const dels = getProjectDeliverables(project.id);
  const done = dels.filter((d) => d.status === "done").length;
  const total = dels.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link to={`/my-projects/${project.id}`} className="block border border-border rounded-lg p-5 bg-card glow-border hover:border-primary/40 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">{project.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">PM: {project.pmName}</p>
        </div>
        <FolderOpen size={16} className="text-primary shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{project.description}</p>

      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Progress</span>
          <span className="text-xs font-bold text-primary">{pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-3">
        <span className="flex items-center gap-1"><Users size={10} /> {project.memberIds.length} members</span>
        <span className="flex items-center gap-1"><BarChart3 size={10} /> {done}/{total} done</span>
      </div>
    </Link>
  );
};

// ─── Admin Notifications Panel ───────────────────────────────
const NotificationsPanel = () => {
  const { notifications, markNotificationRead } = useProjects();
  const unread = notifications.filter((n) => !n.read);

  if (unread.length === 0) return (
    <div className="border border-border rounded-lg p-4 bg-card text-center">
      <p className="text-xs text-muted-foreground">No new notifications</p>
    </div>
  );

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Bell size={14} className="text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-foreground">Activity Feed</span>
        <span className="ml-auto text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">{unread.length}</span>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {unread.map((n) => (
          <div key={n.id} className="px-4 py-3 border-b border-border last:border-0 flex items-start gap-3 hover:bg-secondary/30 transition-colors">
            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground">{n.message}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(n.timestamp).toLocaleString()}</p>
            </div>
            <button onClick={() => markNotificationRead(n.id)} className="text-[10px] text-muted-foreground hover:text-primary shrink-0">dismiss</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── My Projects Page ────────────────────────────────────────
const MyProjects = () => {
  const { user, isAuthenticated } = useAuth();
  const { getMyProjects } = useProjects();
  const [createOpen, setCreateOpen] = useState(false);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!["Admin", "PM", "Member"].includes(user.role)) return <Navigate to="/" replace />;

  const myProjects = getMyProjects();
  const isAdmin = user.role === "Admin";

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
            {isAdmin && (
              <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
                <Plus size={16} /> New Project
              </button>
            )}
          </div>
          <p className="text-muted-foreground mb-8">
            Signed in as <span className="text-primary font-semibold">{user.role}</span> · {user.name}
          </p>

          {/* Admin notification feed */}
          {isAdmin && (
            <div className="mb-8">
              <NotificationsPanel />
            </div>
          )}

          {/* Project grid */}
          {myProjects.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-12 text-center">
              <FolderOpen size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No projects assigned yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
        </div>
      </section>

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </PageWrapper>
  );
};

export default MyProjects;
