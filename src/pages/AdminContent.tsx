import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────
interface TeamMember { id: string; name: string; role: string; headshot: string | null; }
interface PortfolioCompany { id: string; name: string; category: string; description: string; }
interface Project { id: string; name: string; status: string; description: string; }

const CATEGORIES = ["AI", "SaaS", "Fintech", "HealthTech", "EdTech", "CleanTech", "Other"];

// ─── Initial Mock Data ───────────────────────────────────────
const INIT_TEAM: TeamMember[] = [
  { id: "1", name: "Marcus Johnson", role: "President", headshot: null },
  { id: "2", name: "Sarah Chen", role: "VP of Finance", headshot: null },
  { id: "3", name: "David Park", role: "Director of Research", headshot: null },
];

const INIT_PORTFOLIO: PortfolioCompany[] = [
  { id: "1", name: "NeuralPay", category: "Fintech", description: "AI-powered payment processing" },
  { id: "2", name: "HealthSync", category: "HealthTech", description: "Telehealth platform" },
];

const INIT_PROJECTS: Project[] = [
  { id: "1", name: "Venture Lab", status: "Active", description: "Student-led venture fund" },
  { id: "2", name: "Deal Sourcing", status: "Active", description: "Pipeline management tool" },
];

// ─── Modal Wrapper ───────────────────────────────────────────
const Modal = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Team Tab ────────────────────────────────────────────────
const TeamTab = () => {
  const [members, setMembers] = useState<TeamMember[]>(INIT_TEAM);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [headshot, setHeadshot] = useState<string | null>(null);

  const openNew = () => { setEditId(null); setName(""); setRole(""); setHeadshot(null); setModalOpen(true); };
  const openEdit = (m: TeamMember) => { setEditId(m.id); setName(m.name); setRole(m.role); setHeadshot(m.headshot); setModalOpen(true); };

  const save = () => {
    if (!name.trim()) return;
    if (editId) {
      setMembers((prev) => prev.map((m) => m.id === editId ? { ...m, name, role, headshot } : m));
      toast({ title: "Member Updated" });
    } else {
      setMembers([...members, { id: Date.now().toString(), name, role, headshot }]);
      toast({ title: "Member Added" });
    }
    setModalOpen(false);
  };

  const remove = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    toast({ title: "Member Removed" });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Team Members</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors">
          <Plus size={14} /> New Member
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Role</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground">{m.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{m.role}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(m)} className="text-muted-foreground hover:text-primary mr-3"><Pencil size={14} /></button>
                  <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Member" : "New Member"}>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none" placeholder="Full name" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Role</label>
            <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none" placeholder="e.g. Analyst" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Headshot</label>
            <label className="flex items-center gap-2 border border-dashed border-border rounded-md p-3 cursor-pointer hover:border-primary transition-colors">
              <Upload size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{headshot || "Upload image"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setHeadshot(e.target.files?.[0]?.name || null)} />
            </label>
          </div>
          <button onClick={save} className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
            {editId ? "Save Changes" : "Add Member"}
          </button>
        </div>
      </Modal>
    </>
  );
};

// ─── Portfolio Tab ───────────────────────────────────────────
const PortfolioTab = () => {
  const [companies, setCompanies] = useState<PortfolioCompany[]>(INIT_PORTFOLIO);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");

  const save = () => {
    if (!name.trim()) return;
    setCompanies([...companies, { id: Date.now().toString(), name, category, description }]);
    setModalOpen(false);
    toast({ title: "Company Added" });
  };

  const remove = (id: string) => {
    setCompanies((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Company Removed" });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Portfolio Companies</h2>
        <button onClick={() => { setName(""); setCategory(CATEGORIES[0]); setDescription(""); setModalOpen(true); }} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors">
          <Plus size={14} /> New Company
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Description</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground">{c.name}</td>
                <td className="px-4 py-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span></td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{c.description}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Company">
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none" placeholder="Company name" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-card border border-border rounded-md p-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none" placeholder="Brief description" />
          </div>
          <button onClick={save} className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
            Add Company
          </button>
        </div>
      </Modal>
    </>
  );
};

// ─── Projects Tab ────────────────────────────────────────────
const ProjectsTab = () => {
  const [projects, setProjects] = useState<Project[]>(INIT_PROJECTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [description, setDescription] = useState("");

  const save = () => {
    if (!name.trim()) return;
    setProjects([...projects, { id: Date.now().toString(), name, status, description }]);
    setModalOpen(false);
    toast({ title: "Project Added" });
  };

  const remove = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Project Removed" });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Projects</h2>
        <button onClick={() => { setName(""); setDescription(""); setModalOpen(true); }} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors">
          <Plus size={14} /> New Project
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3 hidden sm:table-cell">Description</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground">{p.name}</td>
                <td className="px-4 py-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.status}</span></td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{p.description}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Project">
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent scarlet-input px-0 py-2 text-foreground text-sm focus:outline-none" placeholder="Project name" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-card border border-border rounded-md p-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none" placeholder="Brief description" />
          </div>
          <button onClick={save} className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
            Add Project
          </button>
        </div>
      </Modal>
    </>
  );
};

// ─── Main CMS Dashboard ─────────────────────────────────────
const AdminContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<"Team" | "Portfolio" | "Projects">("Team");

  if (!isAuthenticated || user?.role !== "Admin") return <Navigate to="/login" replace />;

  const tabs: ("Team" | "Portfolio" | "Projects")[] = ["Team", "Portfolio", "Projects"];

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Content Management</h1>
          <p className="text-muted-foreground mb-8">Manage website content across sections.</p>

          <div className="flex gap-1 border-b border-border mb-8">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Team" && <TeamTab />}
          {tab === "Portfolio" && <PortfolioTab />}
          {tab === "Projects" && <ProjectsTab />}
        </div>
      </section>
    </PageWrapper>
  );
};

export default AdminContent;
