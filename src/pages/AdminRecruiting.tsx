import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import PageWrapper from "@/components/PageWrapper";
import { toast } from "@/hooks/use-toast";
import {
  ChevronRight, ChevronDown, User, Loader2, Eye,
  CheckCircle, XCircle, RotateCcw, X,
} from "lucide-react";
import {
  getAllApplicants, getApplicationsByApplicantIds,
  advanceApplicant, setApplicantStatus,
} from "@/lib/api/applicants";
import type { Applicant, Application, EssayAnswer } from "@/lib/database.types";

type RoundKey = "r0" | "r1" | "r2";
const ROUNDS: RoundKey[] = ["r0", "r1", "r2"];
const ROUND_LABELS: Record<RoundKey, string> = { r0: "Application", r1: "Round 1", r2: "Round 2" };
const NEXT_ROUND: Record<RoundKey, RoundKey | null> = { r0: "r1", r1: "r2", r2: null };

// ─── Application detail modal ──────────────────────────────────
const AppDetailModal = ({
  applicant,
  application,
  onClose,
  onAdvance,
  onAccept,
  onReject,
  actionLoading,
}: {
  applicant: Applicant;
  application: Application | null;
  onClose: () => void;
  onAdvance: () => void;
  onAccept: () => void;
  onReject: () => void;
  actionLoading: boolean;
}) => {
  const essays = (application?.essay_answers as unknown as EssayAnswer[]) ?? [];
  const nextRound = NEXT_ROUND[applicant.current_round];
  const isPending = applicant.status === "pending";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-lg w-full max-w-2xl mx-4 p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">{applicant.name}</h3>
            <p className="text-sm text-muted-foreground">{applicant.email}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* Status + Round badges */}
        <div className="flex gap-2 mb-6">
          <span className="text-xs bg-secondary px-2.5 py-1 rounded-full text-muted-foreground">
            {ROUND_LABELS[applicant.current_round]}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full ${
            applicant.status === "accepted" ? "bg-green-500/10 text-green-400" :
            applicant.status === "rejected" ? "bg-destructive/10 text-destructive" :
            "bg-primary/10 text-primary"
          }`}>
            {applicant.status}
          </span>
        </div>

        {/* Application data */}
        {application && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["School", application.school],
                ["Major", application.major],
                ["Year", application.year],
                ["GPA", application.gpa],
                ["Phone", application.phone],
              ].filter(([, v]) => v).map(([label, value]) => (
                <div key={label}>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{label}</span>
                  <p className="text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {application.linkedin_url && (
              <a
                href={application.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                LinkedIn Profile →
              </a>
            )}

            {application.resume_url && (
              <a
                href={application.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm text-primary border border-primary/30 px-3 py-1.5 rounded hover:bg-primary/5 transition-colors"
              >
                Download Resume
              </a>
            )}

            {essays.length > 0 && (
              <div className="space-y-4 border-t border-border pt-4">
                {essays.map((ea, i) => (
                  <div key={i}>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                      Q{i + 1}: {ea.question_text}
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{ea.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {nextRound && (
              <button
                disabled={actionLoading}
                onClick={onAdvance}
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
              >
                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <ChevronRight size={13} />}
                Advance to {ROUND_LABELS[nextRound]}
              </button>
            )}
            <button
              disabled={actionLoading}
              onClick={onAccept}
              className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-green-500 transition-colors disabled:opacity-40"
            >
              <CheckCircle size={13} /> Accept
            </button>
            <button
              disabled={actionLoading}
              onClick={onReject}
              className="flex items-center gap-1.5 border border-destructive text-destructive px-4 py-2 rounded-md text-sm font-semibold hover:bg-destructive/5 transition-colors disabled:opacity-40"
            >
              <XCircle size={13} /> Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Candidate card ────────────────────────────────────────────
const CandidateCard = ({
  applicant,
  onView,
}: {
  applicant: Applicant;
  onView: () => void;
}) => (
  <div className="border border-border rounded-lg p-4 bg-card glow-border">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <User size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{applicant.name}</p>
        <p className="text-xs text-muted-foreground truncate">{applicant.email}</p>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        applicant.status === "accepted" ? "bg-green-500/10 text-green-400" :
        applicant.status === "rejected" ? "bg-destructive/10 text-destructive" :
        "bg-primary/10 text-primary"
      }`}>
        {applicant.status}
      </span>
      <button
        onClick={onView}
        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
      >
        <Eye size={12} /> View
      </button>
    </div>
  </div>
);

// ─── Main page ─────────────────────────────────────────────────
const AdminRecruiting = () => {
  const { user, isAuthenticated } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [openStage, setOpenStage] = useState<RoundKey | null>("r0");
  const [selected, setSelected] = useState<{ applicant: Applicant; application: Application | null } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  if (!isAuthenticated || user?.role !== "Admin") return <Navigate to="/login" replace />;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const aps = await getAllApplicants();
      setApplicants(aps);
      const apps = await getApplicationsByApplicantIds(aps.map((a) => a.id));
      setApplications(apps);
    } catch (e) {
      toast({ title: "Error loading data", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openDetail = (applicant: Applicant) => {
    const app = applications.find((a) => a.applicant_id === applicant.id) ?? null;
    setSelected({ applicant, application: app });
  };

  const handleAdvance = async () => {
    if (!selected) return;
    const nextRound = NEXT_ROUND[selected.applicant.current_round];
    if (!nextRound) return;
    setActionLoading(true);
    try {
      await advanceApplicant(selected.applicant.id, nextRound);
      toast({ title: "Advanced", description: `${selected.applicant.name} moved to ${ROUND_LABELS[nextRound]}` });
      setSelected(null);
      await loadData();
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (status: "accepted" | "rejected") => {
    if (!selected) return;
    setActionLoading(true);
    try {
      await setApplicantStatus(selected.applicant.id, status);
      toast({ title: status === "accepted" ? "Accepted" : "Rejected", description: selected.applicant.name });
      setSelected(null);
      await loadData();
    } catch (e) {
      toast({ title: "Error", description: String(e), variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Recruiting Pipeline</h1>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-md transition-colors"
            >
              <RotateCcw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
          <p className="text-muted-foreground mb-10">Manage applicants across recruitment stages.</p>

          {loading && applicants.length === 0 ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 size={16} className="animate-spin" /> Loading applicants...
            </div>
          ) : (
            <>
              {/* Desktop Kanban */}
              <div className="hidden md:grid grid-cols-3 gap-6">
                {ROUNDS.map((round) => {
                  const cols = applicants.filter((a) => a.current_round === round && a.status === "pending");
                  return (
                    <div key={round} className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
                          {ROUND_LABELS[round]}
                        </h2>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                          {cols.length}
                        </span>
                      </div>
                      {cols.map((a) => (
                        <CandidateCard key={a.id} applicant={a} onView={() => openDetail(a)} />
                      ))}
                      {cols.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No pending candidates</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Accepted / Rejected section */}
              <div className="mt-8 hidden md:block">
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Accepted & Rejected
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {(["accepted", "rejected"] as const).map((status) => {
                    const group = applicants.filter((a) => a.status === status);
                    return (
                      <div key={status}>
                        <p className="text-xs text-muted-foreground mb-2 capitalize">{status} ({group.length})</p>
                        <div className="space-y-2">
                          {group.map((a) => (
                            <CandidateCard key={a.id} applicant={a} onView={() => openDetail(a)} />
                          ))}
                          {group.length === 0 && <p className="text-xs text-muted-foreground italic">None</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Accordion */}
              <div className="md:hidden space-y-3">
                {ROUNDS.map((round) => {
                  const cols = applicants.filter((a) => a.current_round === round && a.status === "pending");
                  const isOpen = openStage === round;
                  return (
                    <div key={round} className="border border-border rounded-lg overflow-hidden bg-card">
                      <button
                        onClick={() => setOpenStage(isOpen ? null : round)}
                        className="w-full flex items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
                            {ROUND_LABELS[round]}
                          </h2>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                            {cols.length}
                          </span>
                        </div>
                        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 space-y-3">
                          {cols.map((a) => (
                            <CandidateCard key={a.id} applicant={a} onView={() => openDetail(a)} />
                          ))}
                          {cols.length === 0 && <p className="text-xs text-muted-foreground italic">No pending candidates</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {selected && (
        <AppDetailModal
          applicant={selected.applicant}
          application={selected.application}
          onClose={() => setSelected(null)}
          onAdvance={handleAdvance}
          onAccept={() => handleStatusChange("accepted")}
          onReject={() => handleStatusChange("rejected")}
          actionLoading={actionLoading}
        />
      )}
    </PageWrapper>
  );
};

export default AdminRecruiting;
