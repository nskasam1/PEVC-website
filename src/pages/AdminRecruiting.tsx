import { useState, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronRight, ChevronDown, User, Calendar, FileText,
  ExternalLink, Plus, X, Upload, Download,
} from "lucide-react";
import {
  getApplications, getFileById, getRecruitingConfig, saveRecruitingConfig,
  getEssayPrompts, saveEssayPrompts, readFileAsBase64, formatDeadline,
} from "@/lib/applicationStorage";
import { Application, CaseMaterial, RecruitingConfig, Stage, StageResource } from "@/types/application";

type PipelineStage = "Application" | "Round 1" | "Round 2";

interface Candidate extends Application {
  stage: PipelineStage;
}

const STAGES: PipelineStage[] = ["Application", "Round 1", "Round 2"];

const WEBHOOK_MESSAGES: Record<string, string> = {
  Application: "Applied -> Confirmation",
  "Round 1": "Invited -> Scheduling Link",
  "Round 2": "Invited -> Final Round Scheduling",
};

// ── Candidate Card ────────────────────────────────────────────────────────────

const CandidateCard = ({
  candidate,
  onAdvance,
  onView,
}: {
  candidate: Candidate;
  onAdvance: (c: Candidate) => void;
  onView: (c: Candidate) => void;
}) => {
  const stage = candidate.stage;
  return (
    <div className="border border-border rounded-lg p-4 bg-card glow-border">
      <button className="flex items-center gap-3 mb-3 w-full text-left" onClick={() => onView(candidate)}>
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
          <User size={14} className="text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{candidate.firstName} {candidate.lastName}</p>
          <p className="text-xs text-muted-foreground truncate">{candidate.email}</p>
        </div>
      </button>
      <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
        <p>{candidate.school}</p>
        <p>{candidate.major} · {candidate.gradYear}</p>
      </div>
      {(stage === "Round 1" || stage === "Round 2") && (
        <div className="flex items-center gap-1.5 mb-3 text-xs text-primary">
          <Calendar size={12} />
          <span>Interview scheduling sent</span>
        </div>
      )}
      <div className="flex items-center gap-3">
        <button onClick={() => onView(candidate)} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
          View application
        </button>
        {STAGES.indexOf(stage) < STAGES.length - 1 && (
          <button onClick={() => onAdvance(candidate)} className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline ml-auto">
            Advance to {STAGES[STAGES.indexOf(stage) + 1]}
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

// ── Application Detail Sheet ──────────────────────────────────────────────────

const ApplicationSheet = ({
  candidate,
  open,
  onClose,
}: {
  candidate: Candidate | null;
  open: boolean;
  onClose: () => void;
}) => {
  if (!candidate) return null;
  const resumeFile = candidate.resumeFileId ? getFileById(candidate.resumeFileId) : undefined;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{candidate.firstName} {candidate.lastName}</SheetTitle>
          <p className="text-sm text-muted-foreground">{candidate.email}</p>
        </SheetHeader>
        <div className="space-y-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Personal Info</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-foreground">
              <span className="text-muted-foreground">Phone</span><span>{candidate.phone}</span>
              <span className="text-muted-foreground">School</span><span>{candidate.school}</span>
              <span className="text-muted-foreground">Major</span><span>{candidate.major}</span>
              <span className="text-muted-foreground">Grad Year</span><span>{candidate.gradYear}</span>
              <span className="text-muted-foreground">LinkedIn</span>
              <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1 hover:underline truncate">
                Profile <ExternalLink size={11} />
              </a>
              <span className="text-muted-foreground">Stage</span>
              <span className="text-primary font-semibold">{candidate.stage}</span>
              <span className="text-muted-foreground">Submitted</span>
              <span>{new Date(candidate.submittedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Resume</p>
            {resumeFile ? (
              <a href={resumeFile.base64Data} download={resumeFile.name} className="flex items-center gap-2 text-primary hover:underline">
                <FileText size={14} />{resumeFile.name}
              </a>
            ) : (
              <p className="text-muted-foreground italic">Not available</p>
            )}
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Essay 1</p>
            <p className="text-xs text-muted-foreground italic mb-2">{candidate.essay1Prompt}</p>
            <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">{candidate.essay1}</p>
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Essay 2</p>
            <p className="text-xs text-muted-foreground italic mb-2">{candidate.essay2Prompt}</p>
            <p className="text-foreground whitespace-pre-wrap break-words leading-relaxed">{candidate.essay2}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ── Configure Tab ─────────────────────────────────────────────────────────────

const ConfigureTab = () => {
  const [config, setConfig] = useState<RecruitingConfig>(getRecruitingConfig);
  const [prompts, setPrompts] = useState(getEssayPrompts);
  const [newResource, setNewResource] = useState<Record<string, { label: string; url: string }>>({
    "Round 1": { label: "", url: "" },
    "Round 2": { label: "", url: "" },
  });
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateStage = (stage: PipelineStage, updates: Partial<RecruitingConfig["stages"][PipelineStage]>) => {
    setConfig((prev) => ({
      ...prev,
      stages: { ...prev.stages, [stage]: { ...prev.stages[stage], ...updates } },
    }));
  };

  const handleSave = () => {
    saveRecruitingConfig(config);
    saveEssayPrompts(prompts);
    toast({ title: "Configuration saved", description: "Changes are live for applicants immediately." });
  };

  const handleCaseUpload = async (stage: "Round 1" | "Round 2", file: File) => {
    const allowed = ["application/pdf", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file", description: "Only PDF or PPTX files are accepted.", variant: "destructive" });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File too large", description: "Case materials must be under 20 MB.", variant: "destructive" });
      return;
    }
    try {
      const base64Data = await readFileAsBase64(file);
      const material: CaseMaterial = {
        id: Date.now().toString(),
        name: file.name.replace(/[^a-zA-Z0-9._\-]/g, "_"),
        base64Data,
        uploadedAt: new Date().toISOString(),
      };
      updateStage(stage, {
        caseMaterials: [...(config.stages[stage].caseMaterials ?? []), material],
      });
      toast({ title: "File added", description: material.name });
    } catch {
      toast({ title: "Upload failed", description: "Could not read the file.", variant: "destructive" });
    }
  };

  const removeCaseMaterial = (stage: "Round 1" | "Round 2", id: string) => {
    updateStage(stage, {
      caseMaterials: (config.stages[stage].caseMaterials ?? []).filter((m) => m.id !== id),
    });
  };

  const addResource = (stage: "Round 1" | "Round 2") => {
    const r = newResource[stage];
    if (!r.label || !r.url) return;
    const resource: StageResource = { id: Date.now().toString(), label: r.label, url: r.url };
    updateStage(stage, { resources: [...(config.stages[stage].resources ?? []), resource] });
    setNewResource((prev) => ({ ...prev, [stage]: { label: "", url: "" } }));
  };

  const removeResource = (stage: "Round 1" | "Round 2", id: string) => {
    updateStage(stage, { resources: (config.stages[stage].resources ?? []).filter((r) => r.id !== id) });
  };

  return (
    <div className="space-y-10">

      {/* Essay Prompts */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Essay Prompts</h3>
        <div className="space-y-4">
          {(["essay1", "essay2"] as const).map((key, i) => (
            <div key={key}>
              <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Essay {i + 1}</label>
              <textarea
                value={prompts[key]}
                onChange={(e) => setPrompts((p) => ({ ...p, [key]: e.target.value }))}
                rows={3}
                className="w-full bg-card border border-border rounded-md p-3 text-sm text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Per-Stage Config */}
      {STAGES.map((stage) => {
        const sc = config.stages[stage];
        const isInterview = stage === "Round 1" || stage === "Round 2";
        return (
          <div key={stage} className="border border-border rounded-lg p-5 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">{stage}</h3>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Application Deadline</label>
                <Input
                  type="date"
                  value={sc.deadline}
                  onChange={(e) => updateStage(stage, { deadline: e.target.value })}
                  className="bg-card border-border"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Hear Back By</label>
                <Input
                  type="date"
                  value={sc.hearBackBy}
                  onChange={(e) => updateStage(stage, { hearBackBy: e.target.value })}
                  className="bg-card border-border"
                />
              </div>
            </div>

            {/* Calendly + Materials (R1/R2 only) */}
            {isInterview && (
              <>
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Calendly URL</label>
                  <Input
                    type="url"
                    placeholder="https://calendly.com/your-link"
                    value={sc.calendlyUrl ?? ""}
                    onChange={(e) => updateStage(stage as "Round 1" | "Round 2", { calendlyUrl: e.target.value })}
                    className="bg-card border-border"
                  />
                </div>

                {/* Case Materials */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Case Materials (PDF / PPTX)</label>
                  <div className="space-y-2 mb-3">
                    {(sc.caseMaterials ?? []).map((m) => (
                      <div key={m.id} className="flex items-center justify-between border border-border rounded-md px-3 py-2 bg-card/50">
                        <a href={m.base64Data} download={m.name} className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Download size={13} />{m.name}
                        </a>
                        <button onClick={() => removeCaseMaterial(stage as "Round 1" | "Round 2", m.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 border border-dashed border-border hover:border-primary/60 rounded-md px-4 py-3 cursor-pointer transition-colors text-sm text-muted-foreground hover:text-foreground">
                    <Upload size={16} />
                    Upload PDF or PPTX
                    <input
                      ref={(el) => { fileInputRefs.current[stage] = el; }}
                      type="file"
                      accept=".pdf,.ppt,.pptx"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCaseUpload(stage as "Round 1" | "Round 2", f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {/* Prep Resources */}
                <div>
                  <label className="text-xs uppercase tracking-widest text-muted-foreground mb-2 block">Prep Resources</label>
                  <div className="space-y-2 mb-3">
                    {(sc.resources ?? []).map((r) => (
                      <div key={r.id} className="flex items-center justify-between border border-border rounded-md px-3 py-2 bg-card/50">
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <ExternalLink size={13} />{r.label}
                        </a>
                        <button onClick={() => removeResource(stage as "Round 1" | "Round 2", r.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Link label"
                      value={newResource[stage]?.label ?? ""}
                      onChange={(e) => setNewResource((p) => ({ ...p, [stage]: { ...p[stage], label: e.target.value } }))}
                      className="bg-card border-border"
                    />
                    <Input
                      placeholder="https://..."
                      value={newResource[stage]?.url ?? ""}
                      onChange={(e) => setNewResource((p) => ({ ...p, [stage]: { ...p[stage], url: e.target.value } }))}
                      className="bg-card border-border"
                    />
                    <Button type="button" size="icon" variant="outline" onClick={() => addResource(stage as "Round 1" | "Round 2")}>
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      <Button onClick={handleSave} className="w-full sm:w-auto">Save Configuration</Button>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const AdminRecruiting = () => {
  const { user, isAuthenticated } = useAuth();
  const [openStage, setOpenStage] = useState<PipelineStage | null>("Application");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const config = getRecruitingConfig();

  const [stageOverrides, setStageOverrides] = useState<Record<string, PipelineStage>>(() => {
    try {
      const raw = localStorage.getItem("pevc_stage_overrides");
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  if (!isAuthenticated || user?.role !== "Admin") return <Navigate to="/login" replace />;

  const candidates: Candidate[] = useMemo(() => {
    return getApplications().map((app) => ({
      ...app,
      stage: (stageOverrides[app.id] ?? "Application") as PipelineStage,
    }));
  }, [stageOverrides]);

  const advance = (candidate: Candidate) => {
    const idx = STAGES.indexOf(candidate.stage);
    if (idx >= STAGES.length - 1) return;
    const nextStage = STAGES[idx + 1];
    const updated = { ...stageOverrides, [candidate.id]: nextStage };
    setStageOverrides(updated);
    try { localStorage.setItem("pevc_stage_overrides", JSON.stringify(updated)); } catch { /* ignore */ }
    toast({ title: "Candidate Advanced", description: `Simulated SendGrid Webhook Fired: ${WEBHOOK_MESSAGES[nextStage]}` });
    localStorage.setItem("pevc_scheduling", nextStage);
  };

  const emptyMessage = (stage: PipelineStage) =>
    stage === "Application"
      ? "No applications yet. Share the /apply link to start receiving submissions."
      : `No candidates in ${stage} yet.`;

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-foreground mb-2">Recruiting</h1>
          <p className="text-muted-foreground mb-8">Manage applicants and configure the recruitment pipeline.</p>

          <Tabs defaultValue="pipeline">
            <TabsList className="mb-8">
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="configure">Configure</TabsTrigger>
            </TabsList>

            {/* ── Pipeline Tab ── */}
            <TabsContent value="pipeline">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {STAGES.map((stage) => {
                  const count = candidates.filter((c) => c.stage === stage).length;
                  const deadline = config.stages[stage].deadline;
                  return (
                    <div key={stage} className="border border-border rounded-lg p-4 bg-card">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{stage}</p>
                      <p className="text-2xl font-bold text-foreground">{count}</p>
                      {deadline && (
                        <p className="text-xs text-muted-foreground mt-1">Due {formatDeadline(deadline)}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Kanban */}
              <div className="hidden md:grid grid-cols-3 gap-6">
                {STAGES.map((stage) => {
                  const stageCandidates = candidates.filter((c) => c.stage === stage);
                  return (
                    <div key={stage} className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">{stage}</h2>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{stageCandidates.length}</span>
                      </div>
                      {stageCandidates.map((c) => (
                        <CandidateCard key={c.id} candidate={c} onAdvance={advance} onView={setSelectedCandidate} />
                      ))}
                      {stageCandidates.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">{emptyMessage(stage)}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile Accordion */}
              <div className="md:hidden space-y-3">
                {STAGES.map((stage) => {
                  const stageCandidates = candidates.filter((c) => c.stage === stage);
                  const isOpen = openStage === stage;
                  return (
                    <div key={stage} className="border border-border rounded-lg overflow-hidden bg-card">
                      <button onClick={() => setOpenStage(isOpen ? null : stage)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">{stage}</h2>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{stageCandidates.length}</span>
                        </div>
                        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 space-y-3">
                          {stageCandidates.map((c) => (
                            <CandidateCard key={c.id} candidate={c} onAdvance={advance} onView={setSelectedCandidate} />
                          ))}
                          {stageCandidates.length === 0 && <p className="text-xs text-muted-foreground italic">{emptyMessage(stage)}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* ── Configure Tab ── */}
            <TabsContent value="configure">
              <ConfigureTab />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <ApplicationSheet candidate={selectedCandidate} open={!!selectedCandidate} onClose={() => setSelectedCandidate(null)} />
    </PageWrapper>
  );
};

export default AdminRecruiting;
