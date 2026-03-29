import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, X, Upload, Loader2,
  ToggleLeft, ToggleRight, Link as LinkIcon,
} from "lucide-react";
import {
  getRoundConfigs, updateRoundOpen, updateEssayQuestions,
  updateResourceLinks, uploadCaseFile, createSlot, getSlots, deleteSlot,
} from "@/lib/api/recruiting";
import type { RoundConfig, EssayQuestion, ResourceLink, InterviewSlot } from "@/lib/database.types";
import { format } from "date-fns";

// ─── Shared Modal ─────────────────────────────────────────────
const Modal = ({
  open, onClose, title, children,
}: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) => {
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

// ─── Recruiting Config Tab ────────────────────────────────────
const RecruitingTab = () => {
  const [configs, setConfigs] = useState<RoundConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Essay editing
  const [editingQuestions, setEditingQuestions] = useState(false);
  const [questions, setQuestions] = useState<EssayQuestion[]>([]);

  // Resource links editing
  const [editingLinks, setEditingLinks] = useState<"r1" | "r2" | null>(null);
  const [links, setLinks] = useState<ResourceLink[]>([]);

  // Slot management
  const [slotRound, setSlotRound] = useState<"r1" | "r2" | null>(null);
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [newSlotDatetime, setNewSlotDatetime] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Case file upload
  const [uploadingCase, setUploadingCase] = useState<"r1" | "r2" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRoundConfigs();
      setConfigs(data);
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const getConfig = (round: "r0" | "r1" | "r2") =>
    configs.find((c) => c.round === round);

  const toggleOpen = async (round: "r0" | "r1" | "r2") => {
    const config = getConfig(round);
    if (!config) return;
    setSaving(round);
    try {
      await updateRoundOpen(round, !config.is_open);
      toast({ title: `${round.toUpperCase()} ${!config.is_open ? "opened" : "closed"}` });
      await load();
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const openQuestionEditor = () => {
    const r0 = getConfig("r0");
    setQuestions(((r0?.essay_questions ?? []) as unknown as EssayQuestion[]).map((q) => ({ ...q })));
    setEditingQuestions(true);
  };

  const saveQuestions = async () => {
    setSaving("r0-questions");
    try {
      await updateEssayQuestions(questions);
      toast({ title: "Essay questions saved" });
      setEditingQuestions(false);
      await load();
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const openLinkEditor = (round: "r1" | "r2") => {
    const config = getConfig(round);
    setLinks(((config?.resource_links ?? []) as unknown as ResourceLink[]).map((l) => ({ ...l })));
    setEditingLinks(round);
  };

  const saveLinks = async () => {
    if (!editingLinks) return;
    setSaving(`${editingLinks}-links`);
    try {
      await updateResourceLinks(editingLinks, links);
      toast({ title: "Resource links saved" });
      setEditingLinks(null);
      await load();
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  const handleCaseFileUpload = async (round: "r1" | "r2", file: File) => {
    setUploadingCase(round);
    try {
      await uploadCaseFile(round, file);
      toast({ title: "Case file uploaded", description: `${round.toUpperCase()} case file updated.` });
      await load();
    } catch (e) {
      toast({ title: "Upload failed", description: String(e), variant: "destructive" });
    } finally {
      setUploadingCase(null);
    }
  };

  const openSlotManager = async (round: "r1" | "r2") => {
    setSlotRound(round);
    setLoadingSlots(true);
    try {
      const data = await getSlots(round);
      setSlots(data);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleAddSlot = async () => {
    if (!slotRound || !newSlotDatetime) return;
    try {
      const slot = await createSlot(slotRound, new Date(newSlotDatetime).toISOString());
      setSlots((prev) => [...prev, slot].sort((a, b) =>
        new Date(a.slot_datetime).getTime() - new Date(b.slot_datetime).getTime()
      ));
      setNewSlotDatetime("");
      toast({ title: "Slot added" });
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await deleteSlot(id);
      setSlots((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Slot removed" });
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 size={14} className="animate-spin" /> Loading config...
      </div>
    );
  }

  const roundConfig = {
    r0: getConfig("r0"),
    r1: getConfig("r1"),
    r2: getConfig("r2"),
  };

  return (
    <div className="space-y-8">
      {/* Round toggles */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Round Status</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {(["r0", "r1", "r2"] as const).map((round) => {
            const config = roundConfig[round];
            const isOpen = config?.is_open ?? false;
            const isSaving = saving === round;
            return (
              <div key={round} className="border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {round === "r0" ? "Applications (R0)" : `Interview ${round.toUpperCase()}`}
                  </p>
                  <p className={`text-xs mt-0.5 ${isOpen ? "text-green-400" : "text-muted-foreground"}`}>
                    {isOpen ? "Open" : "Closed"}
                  </p>
                </div>
                <button
                  disabled={isSaving}
                  onClick={() => toggleOpen(round)}
                  className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
                >
                  {isSaving
                    ? <Loader2 size={22} className="animate-spin" />
                    : isOpen
                      ? <ToggleRight size={28} className="text-primary" />
                      : <ToggleLeft size={28} />
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* R0: Essay Questions */}
      <div className="border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Essay Questions (R0)</h2>
          <button
            onClick={openQuestionEditor}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Pencil size={12} /> Edit
          </button>
        </div>
        {((roundConfig.r0?.essay_questions ?? []) as unknown as EssayQuestion[]).map((q, i) => (
          <p key={q.id} className="text-sm text-foreground mb-2">
            <span className="text-muted-foreground mr-2">{i + 1}.</span>{q.text}
          </p>
        ))}
        {((roundConfig.r0?.essay_questions ?? []) as unknown as EssayQuestion[]).length === 0 && (
          <p className="text-xs text-muted-foreground italic">No questions configured.</p>
        )}
      </div>

      {/* R1 + R2: Case files, resource links, slots */}
      {(["r1", "r2"] as const).map((round) => {
        const config = roundConfig[round];
        const resourceLinks = ((config?.resource_links ?? []) as unknown as ResourceLink[]);
        return (
          <div key={round} className="border border-border rounded-lg p-5 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
              {round === "r1" ? "Round 1" : "Round 2"} Configuration
            </h2>

            {/* Case file */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Case File</p>
              {config?.case_file_url ? (
                <div className="flex items-center gap-3">
                  <a href={config.case_file_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline">
                    View current file →
                  </a>
                  <label className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1">
                    <Upload size={12} /> Replace
                    <input type="file" accept=".pdf,.ppt,.pptx" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleCaseFileUpload(round, file);
                      }} />
                  </label>
                  {uploadingCase === round && <Loader2 size={12} className="animate-spin text-muted-foreground" />}
                </div>
              ) : (
                <label className="flex items-center gap-2 border border-dashed border-border rounded-md p-3 cursor-pointer hover:border-primary transition-colors w-fit">
                  {uploadingCase === round
                    ? <><Loader2 size={14} className="animate-spin" /><span className="text-xs text-muted-foreground">Uploading...</span></>
                    : <><Upload size={14} className="text-muted-foreground" /><span className="text-xs text-muted-foreground">Upload case file (PDF / PPTX)</span></>
                  }
                  <input type="file" accept=".pdf,.ppt,.pptx" className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCaseFileUpload(round, file);
                    }} />
                </label>
              )}
            </div>

            {/* Resource links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Prep Resources</p>
                <button onClick={() => openLinkEditor(round)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Pencil size={12} /> Edit
                </button>
              </div>
              {resourceLinks.length === 0
                ? <p className="text-xs text-muted-foreground italic">No resource links yet.</p>
                : <ul className="space-y-1">
                    {resourceLinks.map((l, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <LinkIcon size={12} className="text-muted-foreground shrink-0" />
                        <a href={l.url} target="_blank" rel="noopener noreferrer"
                          className="text-primary hover:underline truncate">{l.label}</a>
                      </li>
                    ))}
                  </ul>
              }
            </div>

            {/* Interview slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Interview Slots</p>
                <button onClick={() => openSlotManager(round)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <Pencil size={12} /> Manage
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Click "Manage" to add or remove time slots.</p>
            </div>
          </div>
        );
      })}

      {/* Essay Question Editor Modal */}
      <Modal open={editingQuestions} onClose={() => setEditingQuestions(false)} title="Edit Essay Questions (R0)">
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="flex gap-2">
              <textarea
                value={q.text}
                onChange={(e) => setQuestions(questions.map((qq, ii) => ii === i ? { ...qq, text: e.target.value } : qq))}
                rows={2}
                className="flex-1 bg-card border border-border rounded-md p-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none"
                placeholder={`Question ${i + 1}`}
              />
              <button onClick={() => setQuestions(questions.filter((_, ii) => ii !== i))}
                className="text-muted-foreground hover:text-destructive shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setQuestions([...questions, { id: Date.now().toString(), text: "" }])}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Plus size={12} /> Add Question
          </button>
          <button
            onClick={saveQuestions}
            disabled={saving === "r0-questions"}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving === "r0-questions" && <Loader2 size={13} className="animate-spin" />}
            Save Questions
          </button>
        </div>
      </Modal>

      {/* Resource Link Editor Modal */}
      <Modal open={!!editingLinks} onClose={() => setEditingLinks(null)}
        title={`Edit Resource Links (${editingLinks?.toUpperCase()})`}>
        <div className="space-y-4">
          {links.map((l, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <input
                  value={l.label}
                  onChange={(e) => setLinks(links.map((ll, ii) => ii === i ? { ...ll, label: e.target.value } : ll))}
                  placeholder="Label"
                  className="w-full bg-transparent scarlet-input px-0 py-1.5 text-foreground text-sm focus:outline-none"
                />
                <input
                  value={l.url}
                  onChange={(e) => setLinks(links.map((ll, ii) => ii === i ? { ...ll, url: e.target.value } : ll))}
                  placeholder="https://..."
                  className="w-full bg-transparent scarlet-input px-0 py-1.5 text-foreground text-sm focus:outline-none"
                />
              </div>
              <button onClick={() => setLinks(links.filter((_, ii) => ii !== i))}
                className="text-muted-foreground hover:text-destructive mt-2">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            onClick={() => setLinks([...links, { label: "", url: "" }])}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Plus size={12} /> Add Link
          </button>
          <button
            onClick={saveLinks}
            disabled={!!saving}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Links
          </button>
        </div>
      </Modal>

      {/* Slot Manager Modal */}
      <Modal open={!!slotRound} onClose={() => setSlotRound(null)}
        title={`Interview Slots (${slotRound?.toUpperCase()})`}>
        <div className="space-y-4">
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 size={14} className="animate-spin" /> Loading...
            </div>
          ) : (
            <>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {slots.length === 0
                  ? <p className="text-xs text-muted-foreground italic">No slots yet.</p>
                  : slots.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm border border-border rounded-md px-3 py-2">
                        <span className={`text-foreground ${s.is_booked ? "line-through text-muted-foreground" : ""}`}>
                          {format(new Date(s.slot_datetime), "EEE MMM d, h:mm a")}
                          {s.is_booked && <span className="ml-2 text-xs text-primary">(booked)</span>}
                        </span>
                        {!s.is_booked && (
                          <button onClick={() => handleDeleteSlot(s.id)}
                            className="text-muted-foreground hover:text-destructive">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))
                }
              </div>
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={newSlotDatetime}
                  onChange={(e) => setNewSlotDatetime(e.target.value)}
                  className="flex-1 bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <button
                  onClick={handleAddSlot}
                  disabled={!newSlotDatetime}
                  className="bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ─── Team Tab (unchanged from original) ──────────────────────
interface TeamMember { id: string; name: string; role: string; headshot: string | null; }
const INIT_TEAM: TeamMember[] = [
  { id: "1", name: "Marcus Johnson", role: "President", headshot: null },
  { id: "2", name: "Sarah Chen", role: "VP of Finance", headshot: null },
  { id: "3", name: "David Park", role: "Director of Research", headshot: null },
];

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
  const remove = (id: string) => { setMembers((p) => p.filter((m) => m.id !== id)); toast({ title: "Member Removed" }); };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Team Members</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-primary/90">
          <Plus size={14} /> New Member
        </button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-secondary/30">
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Name</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Role</th>
            <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-widest px-4 py-3">Actions</th>
          </tr></thead>
          <tbody>{members.map((m) => (
            <tr key={m.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
              <td className="px-4 py-3 text-sm text-foreground">{m.name}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{m.role}</td>
              <td className="px-4 py-3 text-right">
                <button onClick={() => openEdit(m)} className="text-muted-foreground hover:text-primary mr-3"><Pencil size={14} /></button>
                <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </td>
            </tr>
          ))}</tbody>
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
            <label className="flex items-center gap-2 border border-dashed border-border rounded-md p-3 cursor-pointer hover:border-primary">
              <Upload size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{headshot || "Upload image"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setHeadshot(e.target.files?.[0]?.name || null)} />
            </label>
          </div>
          <button onClick={save} className="w-full bg-primary text-primary-foreground py-2 rounded-md text-sm font-semibold hover:bg-primary/90">{editId ? "Save Changes" : "Add Member"}</button>
        </div>
      </Modal>
    </>
  );
};

// ─── Main AdminContent ────────────────────────────────────────
type Tab = "Recruiting" | "Team";

const AdminContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>("Recruiting");

  if (!isAuthenticated || user?.role !== "Admin") return <Navigate to="/login" replace />;

  const tabs: Tab[] = ["Recruiting", "Team"];

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Content Management</h1>
          <p className="text-muted-foreground mb-8">Manage recruiting configuration and website content.</p>

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

          {tab === "Recruiting" && <RecruitingTab />}
          {tab === "Team" && <TeamTab />}
        </div>
      </section>
    </PageWrapper>
  );
};

export default AdminContent;
