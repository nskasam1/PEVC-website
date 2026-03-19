import { useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects, ALL_MEMBERS, type DeliverableStatus, type ClientInfo } from "@/contexts/ProjectContext";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, X, CheckCircle2, Clock, AlertCircle, FileText,
  Trash2, ChevronDown, Users, Briefcase, Phone, Mail, StickyNote,
  Edit2, Save, Upload, File, Download, Send as SendIcon,
} from "lucide-react";

// ─── File Upload Types & Storage (per-deliverable) ───────────
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  deliverableId: string;
}

const getFilesForDeliverable = (deliverableId: string): UploadedFile[] => {
  try {
    const all = JSON.parse(localStorage.getItem("pevc_files") || "[]") as UploadedFile[];
    return all.filter((f) => f.deliverableId === deliverableId);
  } catch { return []; }
};

const storeFile = (file: UploadedFile) => {
  const all = JSON.parse(localStorage.getItem("pevc_files") || "[]") as UploadedFile[];
  all.push(file);
  localStorage.setItem("pevc_files", JSON.stringify(all));
};

const removeStoredFile = (fileId: string) => {
  const all = JSON.parse(localStorage.getItem("pevc_files") || "[]") as UploadedFile[];
  localStorage.setItem("pevc_files", JSON.stringify(all.filter((f) => f.id !== fileId)));
};

const STATUS_OPTIONS: { value: DeliverableStatus; label: string; color: string; icon: typeof Clock }[] = [
  { value: "not_started", label: "Not Started", color: "text-muted-foreground bg-secondary", icon: AlertCircle },
  { value: "in_progress", label: "In Progress", color: "text-yellow-400 bg-yellow-400/10", icon: Clock },
  { value: "review", label: "In Review", color: "text-blue-400 bg-blue-400/10", icon: FileText },
  { value: "done", label: "Done", color: "text-green-400 bg-green-400/10", icon: CheckCircle2 },
];

const StatusBadge = ({ status, onUpdate, canEdit }: { status: DeliverableStatus; onUpdate?: (s: DeliverableStatus) => void; canEdit: boolean }) => {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_OPTIONS.find((s) => s.value === status)!;
  const Icon = cfg.icon;

  return (
    <div className="relative">
      <button
        onClick={() => canEdit && setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${canEdit ? "cursor-pointer hover:opacity-80" : "cursor-default"}`}
      >
        <Icon size={12} />
        {cfg.label}
        {canEdit && <ChevronDown size={10} />}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-30 w-36 overflow-hidden">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => { onUpdate?.(s.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-secondary/50 transition-colors ${s.value === status ? "bg-secondary/30" : ""}`}
            >
              <s.icon size={12} className={s.color.split(" ")[0]} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Add Deliverable Modal ───────────────────────────────────
const AddDeliverableModal = ({ open, onClose, projectId }: { open: boolean; onClose: () => void; projectId: string }) => {
  const { addDeliverable } = useProjects();
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState(ALL_MEMBERS[0].id);
  const [deadline, setDeadline] = useState("");

  if (!open) return null;

  const submit = () => {
    if (!title.trim()) return;
    const member = ALL_MEMBERS.find((m) => m.id === assigneeId)!;
    addDeliverable({ title, status: "not_started", assigneeId, assigneeName: member.name, deadline: deadline || "TBD", projectId });
    toast({ title: "Deliverable Added", description: `"${title}" assigned to ${member.name}` });
    setTitle(""); setDeadline("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">Add Deliverable</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Assign To</label>
            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none">
              {ALL_MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground mb-1 block">Deadline</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
          </div>
          <button onClick={submit} className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">
            Add Deliverable
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Client Info Panel (PM editable, Admin read) ─────────────
const ClientInfoPanel = ({ project, canEdit }: { project: ReturnType<typeof useProjects>["projects"][0]; canEdit: boolean }) => {
  const { updateClientInfo } = useProjects();
  const [editing, setEditing] = useState(false);
  const [info, setInfo] = useState<ClientInfo>(project.clientInfo);

  const save = () => {
    updateClientInfo(project.id, info);
    setEditing(false);
    toast({ title: "Client Info Updated" });
  };

  return (
    <div className="border border-border rounded-lg p-5 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
          <Briefcase size={14} className="text-primary" /> Client Information
        </h3>
        {canEdit && !editing && (
          <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary transition-colors">
            <Edit2 size={14} />
          </button>
        )}
        {editing && (
          <button onClick={save} className="flex items-center gap-1 text-primary text-xs font-semibold hover:text-primary/80">
            <Save size={12} /> Save
          </button>
        )}
      </div>
      {editing ? (
        <div className="space-y-3">
          <input value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder="Contact Name" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
          <input value={info.company} onChange={(e) => setInfo({ ...info, company: e.target.value })} placeholder="Company" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
          <input value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} placeholder="Email" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
          <input value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} placeholder="Phone" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none" />
          <textarea value={info.notes} onChange={(e) => setInfo({ ...info, notes: e.target.value })} placeholder="Notes, prompts, special instructions..." rows={3} className="w-full bg-card border border-border rounded-md p-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none" />
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-foreground"><Users size={13} className="text-muted-foreground" /> {info.name || "—"}</div>
          <div className="flex items-center gap-2 text-foreground"><Briefcase size={13} className="text-muted-foreground" /> {info.company || "—"}</div>
          <div className="flex items-center gap-2 text-foreground"><Mail size={13} className="text-muted-foreground" /> {info.email || "—"}</div>
          <div className="flex items-center gap-2 text-foreground"><Phone size={13} className="text-muted-foreground" /> {info.phone || "—"}</div>
          {info.notes && (
            <div className="flex items-start gap-2 text-muted-foreground mt-2 pt-2 border-t border-border">
              <StickyNote size={13} className="mt-0.5 shrink-0" />
              <p className="text-xs">{info.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Project Detail Page ─────────────────────────────────────
const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { projects, getProjectDeliverables, updateDeliverableStatus, deleteDeliverable, addMemberToProject } = useProjects();
  const [addOpen, setAddOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(ALL_MEMBERS[0].id);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [fileRefresh, setFileRefresh] = useState(0);

  // Load files from localStorage when project changes
  const projectFiles = id ? getStoredFiles(id) : [];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "deliverable" | "client_package") => {
    const fileList = e.target.files;
    if (!fileList || !user || !id) return;
    Array.from(fileList).forEach((f) => {
      const uploaded: UploadedFile = {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        size: f.size,
        uploadedBy: user.name,
        uploadedByRole: user.role,
        uploadedAt: new Date().toISOString(),
        projectId: id,
        type,
      };
      storeFile(uploaded);
    });
    setFileRefresh((n) => n + 1);
    toast({ title: "File Uploaded", description: `${fileList.length} file(s) uploaded successfully.` });
    e.target.value = "";
  };

  const handleDeleteFile = (fileId: string) => {
    removeStoredFile(fileId);
    setFileRefresh((n) => n + 1);
    toast({ title: "File Removed" });
  };

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const project = projects.find((p) => p.id === id);
  if (!project) return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6 text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Link to="/my-projects" className="text-primary text-sm mt-4 inline-block">← Back to My Projects</Link>
      </section>
    </PageWrapper>
  );

  const isAdmin = user.role === "Admin";
  const isPM = user.role === "PM" && project.pmId === user.id;
  const isMember = user.role === "Member" && project.memberIds.includes(user.id);
  const canManage = isAdmin || isPM;
  // Members can only update status on their own deliverables (checked per-deliverable below)

  const deliverables = getProjectDeliverables(project.id);
  const memberDels = isMember && !canManage ? deliverables.filter((d) => d.assigneeId === user.id) : deliverables;

  const doneCount = deliverables.filter((d) => d.status === "done").length;
  const pct = deliverables.length > 0 ? Math.round((doneCount / deliverables.length) * 100) : 0;

  // Stats
  const statusCounts = STATUS_OPTIONS.map((s) => ({
    ...s,
    count: deliverables.filter((d) => d.status === s.value).length,
  }));

  const handleAddMember = () => {
    addMemberToProject(project.id, selectedMember);
    const member = ALL_MEMBERS.find((m) => m.id === selectedMember);
    toast({ title: "Member Added", description: `${member?.name} added to ${project.name}` });
    setAddMemberOpen(false);
  };

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Back link */}
          <Link to="/my-projects" className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary text-sm mb-6 transition-colors">
            <ArrowLeft size={14} /> Back to My Projects
          </Link>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
              <p className="text-xs text-muted-foreground mt-2">PM: <span className="text-primary font-semibold">{project.pmName}</span> · Created {project.createdAt}</p>
            </div>
            {canManage && (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setAddMemberOpen(true)} className="flex items-center gap-1.5 border border-border text-foreground px-3 py-2 rounded-md text-xs font-semibold hover:border-primary/40 transition-colors">
                  <Users size={14} /> Add Member
                </button>
                <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors">
                  <Plus size={14} /> Deliverable
                </button>
              </div>
            )}
          </div>

          {/* Progress overview */}
          <div className="border border-border rounded-lg p-5 bg-card mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Overall Progress</span>
              <span className="text-lg font-bold text-primary">{pct}%</span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex flex-wrap gap-4">
              {statusCounts.map((s) => (
                <div key={s.value} className="flex items-center gap-1.5 text-xs">
                  <s.icon size={12} className={s.color.split(" ")[0]} />
                  <span className="text-muted-foreground">{s.label}:</span>
                  <span className="text-foreground font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deliverables list */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-3">Deliverables</h2>
              {memberDels.length === 0 ? (
                <div className="border border-dashed border-border rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">No deliverables yet.</p>
                </div>
              ) : (
                memberDels.map((d) => (
                  <div key={d.id} className="border border-border rounded-lg px-4 py-3 bg-card flex items-center justify-between gap-3 glow-border">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${d.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>{d.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.assigneeName} · Due {d.deadline}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={d.status} canEdit={canManage || (isMember && d.assigneeId === user.id)} onUpdate={(s) => {
                        updateDeliverableStatus(d.id, s);
                        toast({ title: "Status Updated", description: `"${d.title}" → ${s.replace("_", " ")}` });
                      }} />
                      {canManage && (
                        <button onClick={() => { deleteDeliverable(d.id); toast({ title: "Deleted", description: d.title }); }} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}


              {/* File Upload Section */}
              {(canManage || isMember) && (
                <div className="border border-border rounded-lg p-5 bg-card mt-6">
                  <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4 flex items-center gap-2">
                    <Upload size={14} className="text-primary" /> Files
                  </h2>

                  {/* Upload buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {isMember && (
                      <label className="flex items-center gap-1.5 border border-border text-foreground px-3 py-2 rounded-md text-xs font-semibold hover:border-primary/40 transition-colors cursor-pointer">
                        <Upload size={14} /> Upload Deliverable
                        <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, "deliverable")} />
                      </label>
                    )}
                    {isPM && (
                      <label className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
                        <SendIcon size={14} /> Send to Client
                        <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e, "client_package")} />
                      </label>
                    )}
                  </div>

                  {/* File list */}
                  {projectFiles.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No files uploaded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {projectFiles.map((f) => (
                        <div key={f.id} className="flex items-center justify-between border border-border rounded-md px-3 py-2 bg-secondary/30">
                          <div className="flex items-center gap-2 min-w-0">
                            <File size={14} className="text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {f.uploadedBy} · {f.type === "client_package" ? "Client Package" : "Deliverable"} · {(f.size / 1024).toFixed(1)}KB
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {canManage && (
                              <button onClick={() => handleDeleteFile(f.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Client info - visible to Admin and PM */}
              {(isAdmin || isPM) && <ClientInfoPanel project={project} canEdit={isPM} />}

              {/* Team members */}
              <div className="border border-border rounded-lg p-5 bg-card">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-3 flex items-center gap-2">
                  <Users size={14} className="text-primary" /> Team
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">PM</span>
                    {project.pmName}
                  </div>
                  {project.memberIds.map((mid) => {
                    const member = ALL_MEMBERS.find((m) => m.id === mid);
                    return (
                      <div key={mid} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="w-6 h-6 rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-[10px] font-bold">M</span>
                        {member?.name || mid}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AddDeliverableModal open={addOpen} onClose={() => setAddOpen(false)} projectId={project.id} />

      {/* Add Member mini-modal */}
      {addMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setAddMemberOpen(false)}>
          <div className="bg-card border border-border rounded-lg w-full max-w-xs mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-foreground mb-4">Add Member</h3>
            <select value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none mb-4">
              {ALL_MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button onClick={handleAddMember} className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors">Add</button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default ProjectDetail;
